const { createPendingOrder, getOrderHistory, cancelOrder } = require("./order.service");
const { orderQueue } = require("../../queues/order.queue")
const { getHolding } = require("../portfolio/portfolio.service")

async function buyStock(req, res, next) {
    try {
        const { symbol, quantity, orderType, limitPrice } = req.body;
        
        const userId = req.user.userId;
        const order = await createPendingOrder(userId, symbol, quantity, 'BUY', orderType, limitPrice);
        if (orderType === "MARKET"){
            await orderQueue.add("execute-order",{
                orderId: order.id,
                jobId: order.id
            })
        }

        console.log("Adding job to queue:", order.id)
        res.status(202).json({ 
            success:true,
            message: "Buy Order Placed",
            orderId: order.id,
            status: "PENDING" 
        })
    } catch (error) {
        next(error);
    }
}

async function sellStock(req, res, next) {
    try {
        const { symbol, quantity, orderType, limitPrice } = req.body;
        const userId = req.user.userId;

        const currentHolding = await getHolding(userId, symbol);
        if(!currentHolding || Number(currentHolding.quantity) < quantity){
            return res.status(400).json({
                error: `Insufficient holdings. you only have ${currentHolding ? currentHolding.quantity : 0} quantity of ${symbol}`
            })
        }

        const order = await createPendingOrder( userId, symbol, quantity, 'SELL', orderType, limitPrice)
        if(orderType === "MARKET"){
            await orderQueue.add("execute-order",{
                orderId: order.id,
                jobId:order.id
            })
        }
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
        next(error)
    }
}

async function cancelMyOrder(req, res, next) {
    try{
        const { orderId } = req.params;
        const userId = req.user.userId;
        const order = await cancelOrder(userId, orderId)

        res.json({
            success: true,
            message: "Order cancelled successfully.",
            order
        })
    } catch(err){
        next(err)
    }
}

module.exports = { buyStock, sellStock, orderHistory, cancelMyOrder }