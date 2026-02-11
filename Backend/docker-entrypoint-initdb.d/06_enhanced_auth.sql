ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS pin VARCHAR(255),
ADD COLUMN IF NOT EXISTS pin_enabled BOOLEAN DEFAULT FALSE;

-- Make password optional (for Google/Phone auth)
ALTER TABLE users 
ALTER COLUMN password DROP NOT NULL;

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
    phone VARCHAR(20) PRIMARY KEY,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- ============================================
-- CRITICAL: Run this in your database NOW
-- ============================================

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS pin VARCHAR(255),
ADD COLUMN IF NOT EXISTS pin_enabled BOOLEAN DEFAULT FALSE;

-- Make password optional (for Google/Phone auth)
ALTER TABLE users 
ALTER COLUMN password DROP NOT NULL;

-- Make username optional
ALTER TABLE users 
ALTER COLUMN username DROP NOT NULL;

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
    phone VARCHAR(20) PRIMARY KEY,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';