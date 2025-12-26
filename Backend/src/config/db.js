const { Pool } = require("pg")

const pool = new Pool({
    host:"localhost",
    user:"postgres",
    password:"GattaRoad",
    database:"stock-trading", 
    port:5432,
});

pool.on("connect",()=>{
    console.log("PostgreSQL connected.")
});


pool.on("error",(error)=>{
    console.error("Unexpected PG error",error);
    process.exit(1);
})

module.exports = { query: (text, params) => pool.query(text, params)}