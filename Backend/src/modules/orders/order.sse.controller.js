const orderEvents = require("../../events/order.events")

async function orderUpdateSSE(req,res){
    const userId = req.user.userId;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const {rows: orders} = await db.query(`SELECT id, symbol, status, price, failure_reason FROM orders WHERE user_id = $1 ORDERS BY created_at DESC`, [ userId ])

    res.write(
        `data: ${JSON.stringify({
            type: "INIT",
            orders
        })} \n\n`
    )

    const listener = (event) =>{
        if(event.userId === userId){
            res.write(`data: ${JSON.stringify({
                type: "UPDATE",
                ...event
            })} \n\n`)
        }
    }

    const heartBeat = setInterval(() => {
        res.write(": ping:\n\n");
    }, 15000);

    // orderEvents.on("order:update",listener)
    req.on("close",() => {
        orderEvents.off("order:update",listener);
        res.end();
    })
}   

module.exports = { orderUpdateSSE }