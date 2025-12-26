const axios = require("axios");
// const { cache } = require("react");  
const priceCache = new Map();
const CACHE_TTL = 30*1000;

async function getLivePrice(symbol) {
    const cached = priceCache.get(symbol);
    const now = Date.now();

    if(cached && now - cached.timestamp < CACHE_TTL){
        return cached.data;
    }
    const data = await fetchPriceFromAPI(symbol);

    priceCache.set(symbol, { data, timestamp: now })

    return data;
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
    console.log("AI_KEY: ", process.env.ALPHA_VANTAGE_API_KEY)

    const data = response.data;
    if(data["Error Message"] || data["Note"] || data["Information"]){
        const err = new Error(
            data["Error Message"] || data["Note"] || data["Information"]
        );
        err.status = 502;
        throw err;
    }
    const quote = response.data["Global Quote"];
    if(!quote || !quote["05. price"]){
        const err = new Error("Unable to fetch live price.")
        err.status = 404
        throw err;
    }
    // const data = response.data;
    // if(data["Error Message"] || data["Note"]){
    //     const err = new Error(data["Error Message"] || data["Note"])
    //     err.status = 502
    //     throw err; 
    // };

    // const series = data["Time Series (5min)"];
    // if(!series){
    //     const err = new Error("Time series data not available");
    //     err.status = 404
    //     throw err;
    // }

    // const latestTimeStamp = Object.keys(series)[0];
    // const latestCandle = series[latestTimeStamp];

    const price = parseFloat(quote["05. price"]);
    const volume = parseInt(quote["06. volume"] || "10", 10);

    return { price, volume, source: "alpha-vantage"}
}

module.exports = { getLivePrice,fetchPriceFromAPI }