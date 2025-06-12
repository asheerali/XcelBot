from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.dashboards import Dashboard, DashboardCreate
from crud import dashboards as dash_crud
from database import get_db

router = APIRouter(
    prefix="/dashboards",
    tags=["Dashboards"]
)

@router.post("/", response_model=Dashboard)
def create_dashboard(dash: DashboardCreate, db: Session = Depends(get_db)):
    return dash_crud.create_dashboard(db, dash)

@router.get("/", response_model=list[Dashboard])
def get_dashboards(db: Session = Depends(get_db)):
    return dash_crud.get_dashboards(db)
