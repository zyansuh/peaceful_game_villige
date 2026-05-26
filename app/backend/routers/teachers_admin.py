import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.teachers import Teachers

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/teachers-admin", tags=["teachers-admin"])


class DeleteByClassRequest(BaseModel):
    class_name: str


class DeleteByClassResponse(BaseModel):
    deleted_count: int
    message: str


@router.post("/delete-by-class", response_model=DeleteByClassResponse)
async def delete_teachers_by_class(
    request: DeleteByClassRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete all teachers belonging to a specific class"""
    logger.info(f"Deleting all teachers with class_name: {request.class_name}")
    try:
        stmt = delete(Teachers).where(Teachers.class_name == request.class_name)
        result = await db.execute(stmt)
        await db.commit()
        deleted_count = result.rowcount
        logger.info(f"Deleted {deleted_count} teachers from class {request.class_name}")
        return DeleteByClassResponse(
            deleted_count=deleted_count,
            message=f"Successfully deleted {deleted_count} teachers from class {request.class_name}"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting teachers by class: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete teachers: {str(e)}")