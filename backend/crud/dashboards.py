from sqlalchemy.orm import Session
from models_db.dashboards import Dashboard
from schemas.dashboards import DashboardCreate

def create_dashboard(db: Session, dashboard: DashboardCreate):
    db_dash = Dashboard(**dashboard.dict())
    db.add(db_dash)
    db.commit()
    db.refresh(db_dash)
    return db_dash

def get_dashboard(db: Session, dash_id: int):
    return db.query(Dashboard).filter(Dashboard.id == dash_id).first()

def get_dashboards(db: Session):
    return db.query(Dashboard).all()

