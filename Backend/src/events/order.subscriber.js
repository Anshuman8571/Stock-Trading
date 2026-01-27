const { channel } = require("diagnostics_channel");
const { redis } = require("../config/redis")
const EventEmitter = require("events")

const sseBus = new EventEmitter();

async function startOrderSubscriber() {
    console.log("Subscriber started....")
    const sub = redis.duplicate()
    await sub.connect()
    await sub.subscribe("order:update",(message) =>{
        const event = JSON.parse(message);
        console.log("Redis message recieved", event);
        sseBus.emit("order:update", event)
    })
}

module.exports = { sseBus, startOrderSubscriber }