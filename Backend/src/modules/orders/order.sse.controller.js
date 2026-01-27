// const orderEvents = require("../../events/order.events")
const {createSubscriber} = require("../../config/redis")
const { CHANNEL } = require("../../events/order.pubsub")

const db = require("../../config/db")

async function orderUpdateSSE(req,res){
    const userId = req.user.userId;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const {rows: orders} = await db.query(`SELECT id, symbol, side, status, price, failure_reason FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, [ userId ])

    res.write(
        `data: ${JSON.stringify({
            type: "INIT",
            orders
        })} \n\n`
    )
    const subscriber = await createSubscriber();
    // await subscriber.connect();
    await subscriber.subscribe(CHANNEL, (message) => {
        const event = JSON.parse(message);
        if(event.userId === userId){
            res.write(`data: ${JSON.stringify({
                type: "UPDATE",
                ...event
            })}\n\n`)
        }
    })
    // const listener = (event) =>{
    //     console.log("SSE RECIEVED EVENT", event)
    //     if(event.userId === userId){
    //         res.write(`data: ${JSON.stringify({
    //             type: "UPDATE",
    //             ...event
    //         })} \n\n`)
    //     }
    // }
    // orderEvents.on("order:update",listener)
    const heartBeat = setInterval(() => {
        res.write(": ping:\n\n");
    }, 15000);

    req.on("close",async () => {
        clearInterval(heartBeat);
        await subscriber.unsubscribe(CHANNEL);
        await subscriber.quit();
        // orderEvents.off("order:update",listener);
        res.end();
    })
}   

module.exports = { orderUpdateSSE }