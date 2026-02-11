const { redis, connectRedis } = require("../config/redis");

const CHANNEL = "order:update";

async function publishOrderEvent(event) {
    if (!redis.isOpen) {
        await connectRedis();
    }
    await redis.publish(CHANNEL, JSON.stringify(event));
}

module.exports = { publishOrderEvent, CHANNEL };