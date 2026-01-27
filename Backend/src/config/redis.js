const { createClient } = require("redis")

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

console.log("Using Redis_URL:", redisUrl)

const redisClient = createClient({
    url: redisUrl
})

redisClient.on("connect", () => {
    console.log("Redis connected");
})

redisClient.on("error", (err) => {
    console.error("Redis error", err)
})

async function initRedis(params) {
    if(!redisClient.isOpen){
        try{
            await redisClient.connect();
        } catch(err){
            console.error("Failed to connect to Redis: ", err)
        }
    }
}

initRedis();

async function createSubscriber(params) {
    const sub = redisClient.duplicate();
    await sub.connect();
    return sub;
}

module.exports = { redis: redisClient, createSubscriber };