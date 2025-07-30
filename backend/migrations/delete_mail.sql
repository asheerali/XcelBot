-- Database migration to delete the mails table
-- SQLite version

-- Optional: Create a backup table before deletion (uncomment if needed)
-- CREATE TABLE mails_backup AS SELECT * FROM mails;

-- Drop any indexes related to the mails table first
DROP INDEX IF EXISTS idx_mails_id;
DROP INDEX IF EXISTS idx_mails_receiver_email;
DROP INDEX IF EXISTS idx_mails_company_id;
DROP INDEX IF EXISTS idx_mails_receiving_time;

-- Drop the mails table
DROP TABLE IF EXISTS mails;

-- Verify the table has been deleted (this will fail if table still exists)
-- SELECT name FROM sqlite_master WHERE type='table' AND name='mails';

-- Optional: If you want to remove any references to mails in other tables
-- (uncomment and modify as needed based on your schema)
-- ALTER TABLE other_table DROP COLUMN mail_id;

-- Clean up any triggers related to mails table (if they exist)
-- DROP TRIGGER IF EXISTS trigger_name_related_to_mails;