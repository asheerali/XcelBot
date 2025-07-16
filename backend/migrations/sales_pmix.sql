-- Database migration to add file_name and dashboard columns to sales_pmix table
-- SQLite version

-- Add the file_name column for storing filename
ALTER TABLE sales_pmix ADD COLUMN file_name VARCHAR(255);

-- Add the dashboard column for storing dashboard integer
ALTER TABLE sales_pmix ADD COLUMN dashboard INTEGER;

-- Update existing records to have NULL values (optional, since default is already NULL)
-- UPDATE sales_pmix SET file_name = NULL WHERE file_name IS NULL;
-- UPDATE sales_pmix SET dashboard = NULL WHERE dashboard IS NULL;

-- Add indexes for better query performance
CREATE INDEX idx_sales_pmix_file_name ON sales_pmix (file_name);
CREATE INDEX idx_sales_pmix_dashboard ON sales_pmix (dashboard);

