const db = require("../../config/db")
const { v4: uuidv4 } = require("uuid")
const { getOrCreatePortfolio, reduceHoldings,updateHoldings } = require("../portfolio/portfolio.service")
const { getLivePrice } = require("../market/market.service")
// const { updateHoldings } = require("../portfolio/portfolio.service") 


async function createPendingOrder(userId, symbol, quantity, side) {
    const normalisedSymbol = symbol.trim().toUpperCase();
    const orderId = uuidv4();
    const result = await db.query(`INSERT INTO orders (id, user_id, symbol, quantity, side,  status) VALUES ($1, $2, $3, $4, $5, 'PENDING') RETURNING id`, [ orderId, userId, normalisedSymbol, quantity, side ] );
    console.log("createPendingOrder:", result)
    return { id: result.rows[0].id }
}
//Separated executution logic
async function executeOrder(orderId) {
    console.log("Execution starts....")

    const res = await db.query(`SELECT * FROM orders WHERE id = $1 `, [ orderId ])
    const order = res.rows[0]
    if(!order) throw new Error("Order Not Found.");
    if(order.status !== "PENDING") {
        console.log(`Skipping order ${orderId}, status=${order.status}`)
        return
    }
    
    const { price } = await getLivePrice(order.symbol);
    const orderPrice = price.price;
    if(!orderPrice || !Number.isFinite(orderPrice)) throw new Error("Invalid market price.")
    console.log("Price: ",price)
    let client = null;
    
    try {
        client = await db.getClient();
        await client.query("BEGIN");

        const lockRes = await client.query(`SELECT status FROM orders WHERE id = $1 FOR UPDATE`, [ orderId ])
        if(lockRes.rows[0].status !== "PENDING"){
            await client.query("ROLLBACK")
            return;
        }
        console.log("Updating Order")
        if(order.side === 'BUY') await updateHoldings( client, order.user_id, order.symbol, order.quantity, orderPrice)
        else if(order.side === 'SELL') await reduceHoldings( client, order.user_id, order.symbol, order.quantity)
        console.log("The order gets executed.")
        await client.query(`UPDATE orders SET status = 'EXECUTED', price = $1 WHERE id = $2`, [ orderPrice, orderId ] )
        await client.query(`COMMIT`)
        console.log("order executed:", orderId)
    } catch (error) {
        console.log("The order get Failed.")
        if(client){
            await client.query("ROLLBACK")
            await client.query(`UPDATE orders SET status = 'FAILED' WHERE id = $1`, [ orderId ] )
        }
        throw error;
    } finally {
        if(client) client.release();
    }
}


// async function placeSellOrder(client, userId, symbol, quantity, price) {
//     const portfolio = await getOrCreatePortfolio(userId);
//     const { rows } = await client.query(`SELECT* FROM holdings WHERE portfolio_id = $1 AND symbol = $2`, [ portfolio.id, symbol ])
//     if(rows.length === 0 || rows[0].quantity < quantity){
//         const err = new Error("Not enough quantity to sell");
//         err.status = 400;
//         throw err;
//     } 
//     const orderId = uuidv4();
//     await client.query(`INSERT INTO orders (id, user_id, symbol, quantity, price, side, status) VALUES ($1, $2, $3, $4, $5,'SELL', 'PENDING')`, [ orderId, userId, symbol, quantity, price ]);

//     const remainingQty = rows[0].quantity - quantity;

//     if((remainingQty === 0)){
//         await client.query(`DELETE FROM holdings WHERE id = $1`, [ rows[0].id ]);
//     } else {
//         await client.query(`UPDATE holdings SET quantity = $1 WHERE id = $2`, [ remainingQty, rows[0].id ])
        
//     }

//     await client.query(`UPDATE orders SET status = 'EXECUTED' WHERE id  = $1`, [ orderId ])
//     const sellOrderRow = await client.query(`SELECT * FROM orders WHERE id = $1`, [ orderId ])
//     return sellOrderRow.rows;
// }


async function getOrderHistory(userId) {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at`,[ userId ]);
    return rows;
}

module.exports = { createPendingOrder, getOrderHistory, executeOrder }