ALTER TABLE orders 
ADD COLUMN order_type VARCHAR(10) NOT NULL DEFAULT 'MARKET',
ADD COLUMN limit_price NUMERIC,
ADD COLUMN executed_at TIMESTAMP;

ALTER TABLE orders
ADD CONSTRAINT valid_limit_order
CHECK (
    (order_type = 'LIMIT' AND limit_price IS NOT NULL) OR (order_type = 'MARKET')
);