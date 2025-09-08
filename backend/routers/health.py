from fastapi import APIRouter


# Import from local modules
# from utils import find_file_in_directory

router = APIRouter(
    prefix="/api",
    tags=["health"],
)

@router.get("/health")
async def health_check():
    return {"status": "ok for the docker container test 21"}
