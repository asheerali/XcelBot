import pandas as pd

# Load Excel file (replace 'your_file.xlsx' with the actual file path)
file_path = '1.xlsx'

# Define the columns you want to keep
columns_to_keep = [
    'Location', 'Sent Date', 'Dining Option', 'Net Price', 'Qty', 'Store', 'Date'
]

# Read from the specific sheet named 'data'
df = pd.read_excel(file_path)

# Filter the DataFrame to keep only the specified columns
filtered_df = df[columns_to_keep]

# Save the new file
filtered_df.to_excel('filtered_output.xlsx', index=False)

print("Filtered data saved to 'filtered_output.xlsx'")
