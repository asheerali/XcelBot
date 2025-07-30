-- Database migration to add isActive column to users table
-- SQLite version

-- Add the isActive column with default value True
ALTER TABLE users ADD COLUMN isActive BOOLEAN DEFAULT TRUE NOT NULL;

-- Update existing users to be active by default (optional, since default is already set)
UPDATE users SET isActive = TRUE WHERE isActive IS NULL;

-- Add an index on isActive for better query performance (optional but recommended)
CREATE INDEX idx_users_isactive ON users (isActive);

-- SQLite doesn't support partial indexes the same way as PostgreSQL
-- But you can create a regular index which will still help with queries