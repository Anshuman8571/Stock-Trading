const orderEvents = require("../../events/order.events")

function orderUpdateSSE(req,res){
    const userId = req.user.userId;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const listener = (event) =>{
        if(event.userId === userId){
            res.write(`data: ${JSON.stringify(event)} \n\n`)
        }
    }
    orderEvents.on("order:update",listener)
    req.on("close",() => {
        orderEvents.off("order:update",listener);
        res.end();
    })
}   

module.exports = { orderUpdateSSE }