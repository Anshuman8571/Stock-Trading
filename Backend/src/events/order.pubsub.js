const { redis } = require("../config/redis")

const CHANNEL = "order:update"

async function publishOrderEvent(event) {
    await redis.publish(CHANNEL, JSON.stringify(event));
}

module.exports = { publishOrderEvent, CHANNEL }