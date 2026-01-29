const { createClient } = require("redis")

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

console.log("Using Redis_URL:", redisUrl)

const redisClient = createClient({
    url: redisUrl,
    socket: {
        reconnectStrategy: retries => {
            if(retries > 10) {
                return new Error("Redis reconnect retries exhausted");
            }
            return Math.min(retries * 500, 5000)
        }
    }
})

redisClient.on("connect", () => {
    console.log("Redis connected");
})

redisClient.on("error", (err) => {
    console.error("Redis error", err.message)
})

// async function initRedis(params) {
//     if(!redisClient.isOpen){
//         try{
//             await redisClient.connect();
//         } catch(err){
//             console.error("Failed to connect to Redis: ", err)
//         }
//     }
// }

async function connectRedis() {
    if(!redisClient.isOpen) await redisClient.connect();
}

// initRedis();

async function createSubscriber(params) {
    const sub = redisClient.duplicate();
    await sub.connect();
    return sub;
}

module.exports = { redis: redisClient, connectRedis, createSubscriber };