-- Database migration to add file_name and dashboard columns to budget table
-- SQLite version

-- Add the file_name column for storing filename
ALTER TABLE budget ADD COLUMN file_name VARCHAR(255);

-- Add the dashboard column for storing dashboard integer
ALTER TABLE budget ADD COLUMN dashboard INTEGER;

-- Update existing records to have NULL values (optional, since default is already NULL)
-- UPDATE budget SET file_name = NULL WHERE file_name IS NULL;
-- UPDATE budget SET dashboard = NULL WHERE dashboard IS NULL;

-- Add indexes for better query performance
CREATE INDEX idx_budget_file_name ON budget (file_name);
CREATE INDEX idx_budget_dashboard ON budget (dashboard);

-- -- Optional: Create a composite index for queries filtering by both company_id and file_name
-- CREATE INDEX idx_budget_company_file ON budget (company_id, file_name);

-- -- Optional: Create a composite index for queries filtering by both company_id and dashboard
-- CREATE INDEX idx_budget_company_dashboard ON budget (company_id, dashboard);

-- -- Optional: Create a composite index for queries filtering by company_id, store, and year
-- CREATE INDEX idx_budget_company_store_year ON budget (company_id, Store, Year);

-- -- Verify the columns were added successfully
-- -- PRAGMA table_info(budget);