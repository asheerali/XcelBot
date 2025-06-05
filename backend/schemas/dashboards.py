from pydantic import BaseModel

class DashboardBase(BaseModel):
    name: str

class DashboardCreate(DashboardBase):
    pass

class Dashboard(DashboardBase):
    id: int

    class Config:
        from_attributes = True
