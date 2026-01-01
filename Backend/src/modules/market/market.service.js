const axios = require("axios");
const redisClient = require("../../config/redis");
// const { cache } = require("react");
// Removed in-memory Cache

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
    await redisClient.setEx(cachedKey, PRICE_TTL, price.price.toString());
    return { price };
}

async function fetchPriceFromAPI(symbol) {
    const url = `https://alphavantage.co/query`;
    symbol = symbol + ".BSE"
    const response = await axios.get(url, {
        params: {
            function: "TIME_SERIES_DAILY",
            symbol,
            outputsize: "compact",
            apikey: process.env.ALPHA_VANTAGE_API_KEY
        }
    });

    // console.log("alpha response: ", JSON.stringify(response.data["Time Series (Daily)"], null, 2))
    console.log("API_KEY: ", process.env.ALPHA_VANTAGE_API_KEY)

    const quote = response.data["Time Series (Daily)"];
    if( !quote ){
        const err = new Error("Unable to fetch live price.")
        err.status = 404
        throw err;
    }
    // console.log(Object.keys(quote))
    const dates = Object.keys(quote).sort().reverse();
    console.log(`Latest Date:${dates[0]} `, quote[dates[0]])

    const latestClose = parseFloat(quote[dates[0]]["4. close"])
    const previousClose = parseFloat(quote[dates[1]]["4. close"])
    if (!Number.isFinite(latestClose)) {
        const err = new Error("Invalid close price.")
        err.status = 404
        throw err;
    }

    const change = latestClose - previousClose;
    const changePercentage = (change/ previousClose) * 100;
     
    // if(isNaN(price) || price === null || price <= 0) {
    //     console.log("The price is not legal");
    //     throw new Error("Invalid market price");
    // }
    // return { price, volume, source: "alpha-vantage"}
    return { 
        Date: dates[0],
        price: latestClose,
        analysis: {
            previousClose,
            change,
            changePercentage: Number(changePercentage.toFixed(2))
        }  
    };
}

module.exports = { getLivePrice,fetchPriceFromAPI }