ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add full_name column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);

-- Add PIN columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pin VARCHAR(255);

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pin_enabled BOOLEAN DEFAULT FALSE;

-- Make username optional (for flexibility)
ALTER TABLE users 
ALTER COLUMN username DROP NOT NULL;

-- Verify all columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;