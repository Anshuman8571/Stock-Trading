const axios = require("axios");
const redisClient = require("../../config/redis");
// const { cache } = require("react");
const priceCache = new Map();
const CACHE_TTL = 30*1000;

const PRICE_TTL = 60;

async function getLivePrice(symbol) {
    const cachedKey = `price:${symbol}`;
    const cachedPrice = await redisClient.get(cachedKey);
    if(cachedPrice){
        console.log(`Cache HIT for ${symbol} and price ${cachedPrice}`)
        const price = parseFloat(cachedPrice);
        if(!isNaN(price) && price > 0 ) return { price }
        await redisClient.del(cachedKey);
    }
    
    console.log(`Cache MISS for ${symbol}`);
    console.log("Price", cachedPrice)

    const price = await fetchPriceFromAPI(symbol);
    console.log("Price from fetchPriceFromAPI", price)
    await redisClient.setEx(cachedKey, PRICE_TTL, price.toString());
    return { price };
}

async function fetchPriceFromAPI(symbol) {
    const url = `https://alphavantage.co/query`;
    const response = await axios.get(url, {
        params: {
            function: "GLOBAL_QUOTE",
            symbol,
            apikey: process.env.ALPHA_VANTAGE_API_KEY
        }
    });

    console.log("alpha response: ", JSON.stringify(response.data, null, 2))
    console.log("API_KEY: ", process.env.ALPHA_VANTAGE_API_KEY)

    const quote = response.data["Global Quote"];
    if(!quote || !quote["05. price"]){
        const err = new Error("Unable to fetch live price.")
        err.status = 404
        throw err;
    }
    const price = parseFloat(quote["05. price"]);
    const volume = parseInt(quote["06. volume"] || "10", 10);
    if(isNaN(price) || price === null || price <= 0) {
        console.log("The price is not legal");
        throw new Error("Invalid market price");
    }
    // return { price, volume, source: "alpha-vantage"}
    return price;
}

module.exports = { getLivePrice,fetchPriceFromAPI }