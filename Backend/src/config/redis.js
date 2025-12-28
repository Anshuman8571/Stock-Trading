const { createClient } = require("redis")
const redisClient = createClient({
    url: "redis://localhost:6379",
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

module.exports = redisClient;