const { Pool } = require("pg")

const databaseURL = process.env.DATABASE_URL;
if(!databaseURL) {
    throw new Error("database_URL is not defined.");
}

const pool = new Pool({
    connectionString: databaseURL
});

pool.on("connect",()=>{
    console.log("PostgreSQL connected.")
});


pool.on("error",(error)=>{
    console.error("Unexpected PG error",error);
    process.exit(1);
})

module.exports = { 
    query: (text, params) => pool.query(text, params),
    getClient : () => pool.connect(),
    close: () => pool.end()
}