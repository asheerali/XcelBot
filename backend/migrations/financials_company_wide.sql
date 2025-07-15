-- Database migration to add file_name and dashboard columns to financials_company_wide table
-- SQLite version

-- Add the file_name column for storing filename
ALTER TABLE financials_company_wide ADD COLUMN file_name VARCHAR(255);

-- Add the dashboard column for storing dashboard integer
ALTER TABLE financials_company_wide ADD COLUMN dashboard INTEGER;

-- Update existing records to have NULL values (optional, since default is already NULL)
-- UPDATE financials_company_wide SET file_name = NULL WHERE file_name IS NULL;
-- UPDATE financials_company_wide SET dashboard = NULL WHERE dashboard IS NULL;

-- Add indexes for better query performance
CREATE INDEX idx_financials_file_name ON financials_company_wide (file_name);
CREATE INDEX idx_financials_dashboard ON financials_company_wide (dashboard);

-- -- Optional: Create a composite index for queries filtering by both company_id and file_name
-- CREATE INDEX idx_financials_company_file ON financials_company_wide (company_id, file_name);

-- -- Optional: Create a composite index for queries filtering by both company_id and dashboard
-- CREATE INDEX idx_financials_company_dashboard ON financials_company_wide (company_id, dashboard);

-- -- Optional: Create a composite index for queries filtering by company_id, store, and year
-- CREATE INDEX idx_financials_company_store_year ON financials_company_wide (company_id, Store, Year);

-- -- Verify the columns were added successfully
-- -- PRAGMA table_info(financials_company_wide);