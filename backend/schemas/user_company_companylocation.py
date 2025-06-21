from pydantic import BaseModel

class UserCompanyCompanyLocationCreate(BaseModel):
    user_id: int
    company_location_id: int
