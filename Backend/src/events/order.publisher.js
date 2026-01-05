const redis = require("../config/redis")

async function publishOrderEvent(event) {
    await redis.publish("order:update", JSON.stringify(event))    
}

module.exports = { publishOrderEvent }