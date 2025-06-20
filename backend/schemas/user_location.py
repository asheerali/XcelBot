# schemas/user_location.py

from pydantic import BaseModel
from typing import List

class UserLocationBase(BaseModel):
    user_id: int
    company_id: int
    location_id: int

class UserLocationCreate(UserLocationBase):
    pass
