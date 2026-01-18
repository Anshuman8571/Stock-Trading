const db = require("../config/db")
const { getLivePrice } = require("../modules/market/market.service")

const TTL_MS = 30000;

async function getPriceSnapshot(symbol) {
    symbol = symbol.trim().toUpperCase()    
    const { rows } = await db.query(`SELECT price, updated_at FROM market_prices WHERE symbol = $1`, [ symbol ])
    if(rows.length){
        const { price, updated_at } = rows[0];
        const age = Date.now() - new Date(updated_at).getTime();

        if(age<TTL_MS) return { price: Number(price), source: "CACHE" }

    }

    const { price } = await getLivePric(symbol);
    if(!price || !Number.isFinite(price)){
        throw new Error("Unable to fetch Live Price.")
    }

    await db.query(
        `
            INSERT INTO market_prices (symbol, price, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (symbol)
            DO UPDATE SET price = EXCLUDED.price, updated_at = NOW()
        `,
        [ symbol, price ]
    )
    return { price, source: "API" }
}

module.exports = { getPriceSnapshot }