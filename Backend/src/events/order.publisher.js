const { redis } = require("../config/redis")
const { CHANNEL } = require("./order.pubsub")

async function publishOrderEvent(event) {
    await redis.publish(CHANNEL, JSON.stringify(event))    
}

module.exports = { publishOrderEvent }