const { createPendingOrder, placeSellOrder, getOrderHistory } = require("./order.service");
const { orderQueue } = require("../../queues/order.queue")
async function buyStock(req, res, next) {
    try {
        const { symbol, quantity } = req.body;
        if(!symbol || typeof symbol !== "string") return res.status(400).json({ error: "Invalid Symbol" })
        if(!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: "Quantity must be positive and greater than 0." })
        
        console.log("req.User ", req.user)
        const userId = req.user.userId;
        const order = await createPendingOrder(userId, symbol, quantity, 'BUY');
        await orderQueue.add("execute-order",{
            orderId: order.id
        })
        console.log("Adding job to queue:", order.id)
        res.status(202).json({ 
            success:true,
            message: "Buy Order Placed",
            orderId: order.id,
            status: "PENDING" 
        })
        // res.json({ success: true, result })
    } catch (error) {
        next(error);
    }
}

async function sellStock(req, res, next) {
    try {
        const { symbol, quantity } = req.body;
        if(!symbol || typeof symbol !== "string") return res.status(400).json({ error: "Invalid Symbol" })
        if(!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: "Quantity must be positive and greater than 0." })
        const userId = req.user.userId;
        const order = await createPendingOrder(userId, symbol, quantity, 'SELL')
        await orderQueue.add("execute-order",{
            orderId: order.id
        })
        res.status(202).json({
            success:true,
            message: "Sell Order Placed",
            orderId: order.id,
            status: "PENDING"
        })
        // const result = await placeSellOrder(req.user.userId,symbol, quantity, price);
        // res.json({ success: true, result})
    } catch (error) {
        next(error)
    }
}

async function orderHistory(req, res, next) {
    try {
        const orders = await getOrderHistory(req.user.userId);
        res.json({ success: true, orders });
    } catch (error) {
        next(err)
    }
}

module.exports = { buyStock, sellStock, orderHistory }