import os

def find_file_in_directory(directory, partial_filename, location_pattern=None):
    """
    Find a file in a directory that contains the partial filename and optional location pattern.
    
    Args:
        directory (str): The directory to search in
        partial_filename (str): Partial name of the file to find
        location_pattern (str, optional): Pattern for location to include in the search
    
    Returns:
        str or None: Full path to the file if found, None otherwise
    """
    if not os.path.exists(directory):
        return None
    
    for filename in os.listdir(directory):
        # Check for the partial filename match
        if partial_filename in filename:
            # If location pattern is provided, check for that too
            if location_pattern is None or location_pattern in filename:
                file_path = os.path.join(directory, filename)
                print(f"Found matching file: {filename}")
                return file_path
    
    # If location pattern was provided but no match found, log it
    if location_pattern:
        print(f"No files found with pattern: {location_pattern} and filename: {partial_filename}")
    else:
        print(f"No files found with filename: {partial_filename}")
        
    return None