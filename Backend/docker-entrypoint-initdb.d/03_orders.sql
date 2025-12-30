CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC ,
    side VARCHAR(4) CHECK(side IN ('BUY','SELL')),
    status VARCHAR(10) CHECK (status IN ('PENDING', 'EXECUTED', 'FAILED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);