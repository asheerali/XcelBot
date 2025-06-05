from pydantic import BaseModel

class StoreBase(BaseModel):
    name: str

class StoreCreate(StoreBase):
    pass

class Store(StoreBase):
    id: int

    class Config:
        from_attributes = True

