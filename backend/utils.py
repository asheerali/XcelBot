import os

def find_file_in_directory(directory, partial_filename):
    """
    Find a file in a directory that contains the partial filename.
    
    Args:
        directory (str): The directory to search in
        partial_filename (str): Partial name of the file to find
    
    Returns:
        str or None: Full path to the file if found, None otherwise
    """
    if not os.path.exists(directory):
        return None
        
    for filename in os.listdir(directory):
        if partial_filename in filename:
            file_path = os.path.join(directory, filename)
            print(f"Found matching file: {filename}")
            return file_path
            
    return None