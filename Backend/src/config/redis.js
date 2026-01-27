const { createClient } = require("redis")
const redisClient = createClient({
    url: process.env.REDIS_URL
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