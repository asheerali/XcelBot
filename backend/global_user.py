from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Middleware to store user info in the global request state
@app.middleware("http")
async def add_user_data_to_request_state(request: Request, call_next):
    # Simulate user data storage, for example:
    user_data = {"id": 1, "name": "John Doe", "email": "john.doe@example.com"}
    
    # Store user data in the request state globally for this request
    request.state.user_data = user_data

    # Pass the request to the next handler (continue processing the request)
    response = await call_next(request)
    
    return response

# Pydantic model for testing
class UserData(BaseModel):
    id: int
    name: str
    email: str

# Endpoint to fetch the stored user data
@app.get("/test-user-data", response_model=UserData)
async def get_user_data(request: Request):
    # Retrieve user data from request state (middleware)
    user_data = request.state.user_data
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User data not found")
    
    # Return the user data stored in request state
    return user_data

# Example of a POST route to simulate updating or storing data
@app.post("/store-user-data")
async def store_user_data(request: Request, user_data: UserData):
    # Store the user data globally in the request state (per request cycle)
    request.state.user_data = user_data.dict()  # Save data as dictionary in request state
    return {"message": "User data stored successfully", "stored_data": user_data}
