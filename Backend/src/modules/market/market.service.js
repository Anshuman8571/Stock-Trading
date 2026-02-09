const axios = require("axios");
const { redis } = require("../../config/redis");

const PRICE_TTL = 300;

async function getLivePrice(symbol) {
    const cachedKey = `price:${symbol.toUpperCase()}`;
    const cachedPrice = await redis.get(cachedKey);

    if(cachedPrice){
        console.log(`Cache HIT for ${symbol} and price ${cachedPrice}`)
        const priceValue = parseFloat(cachedPrice);
        if(!isNaN(priceValue) && priceValue > 0 ) return { price: priceValue }
    }
    
    console.log(`Cache MISS for ${symbol} - Fetching from API`);

    const apiData = await fetchPriceFromAPI(symbol);
    if(apiData && apiData.price) {
        await redis.setEx(cachedKey, PRICE_TTL, apiData.price.toString())
        return { price: apiData.price }
    }

    const NumericPrice = apiData.price;
    console.log("NumericPrice from fetchPriceFromAPI", NumericPrice)
    return { price: null };
}

async function fetchPriceFromAPI(symbol) {
    try {
        const url = `https://www.alphavantage.co/query`;
        const querySymbol = symbol.endsWith('.BSE') || symbol.endsWith('.NSE') ? symbol : symbol + ".BSE"
        const response = await axios.get(url, {
            params: {
                function: "TIME_SERIES_DAILY",
                symbol: querySymbol,
                outputsize: "compact",
                apikey: process.env.ALPHA_VANTAGE_API_KEY
            }
        });
        const quote = response.data["Time Series (Daily)"];
        if( !quote ){
            console.warn(`API Warning for ${symbol}: `, JSON.stringify(response.data))
            return { price: null }
        }
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
        console.log("LatestClose from market service:",latestClose)
        return { 
            Date: dates[0],
            price: latestClose,
            analysis: {
                previousClose,
                change,
                changePercentage: Number(changePercentage.toFixed(2))
            }  
        };
    } catch (error) {
        console.error(`Fetch Error for ${ symbol }:`, error.message)
        return { price: null }
    }
}

module.exports = { getLivePrice,fetchPriceFromAPI }