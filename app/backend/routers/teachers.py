import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.teachers import TeachersService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/teachers", tags=["teachers"])


# ---------- Pydantic Schemas ----------
class TeachersData(BaseModel):
    """Entity data schema (for create/update)"""
    game_category: str
    class_name: str
    nickname: str
    intro: str = None
    detail_intro: str = None
    tier: str = None
    active_time: str = None
    personality: str = None
    teaching_style: str = None
    position: str = None
    message: str = None
    profile_image: str = None
    max_students: int
    current_students: int
    status: str


class TeachersUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    game_category: Optional[str] = None
    class_name: Optional[str] = None
    nickname: Optional[str] = None
    intro: Optional[str] = None
    detail_intro: Optional[str] = None
    tier: Optional[str] = None
    active_time: Optional[str] = None
    personality: Optional[str] = None
    teaching_style: Optional[str] = None
    position: Optional[str] = None
    message: Optional[str] = None
    profile_image: Optional[str] = None
    max_students: Optional[int] = None
    current_students: Optional[int] = None
    status: Optional[str] = None


class TeachersResponse(BaseModel):
    """Entity response schema"""
    id: int
    game_category: str
    class_name: str
    nickname: str
    intro: Optional[str] = None
    detail_intro: Optional[str] = None
    tier: Optional[str] = None
    active_time: Optional[str] = None
    personality: Optional[str] = None
    teaching_style: Optional[str] = None
    position: Optional[str] = None
    message: Optional[str] = None
    profile_image: Optional[str] = None
    max_students: int
    current_students: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TeachersListResponse(BaseModel):
    """List response schema"""
    items: List[TeachersResponse]
    total: int
    skip: int
    limit: int


class TeachersBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[TeachersData]


class TeachersBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: TeachersUpdateData


class TeachersBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[TeachersBatchUpdateItem]


class TeachersBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=TeachersListResponse)
async def query_teacherss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query teacherss with filtering, sorting, and pagination"""
    logger.debug(f"Querying teacherss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = TeachersService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} teacherss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying teacherss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=TeachersListResponse)
async def query_teacherss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query teacherss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying teacherss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = TeachersService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} teacherss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying teacherss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=TeachersResponse)
async def get_teachers(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single teachers by ID"""
    logger.debug(f"Fetching teachers with id: {id}, fields={fields}")
    
    service = TeachersService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Teachers with id {id} not found")
            raise HTTPException(status_code=404, detail="Teachers not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching teachers {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=TeachersResponse, status_code=201)
async def create_teachers(
    data: TeachersData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new teachers"""
    logger.debug(f"Creating new teachers with data: {data}")
    
    service = TeachersService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create teachers")
        
        logger.info(f"Teachers created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating teachers: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating teachers: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[TeachersResponse], status_code=201)
async def create_teacherss_batch(
    request: TeachersBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple teacherss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} teacherss")
    
    service = TeachersService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} teacherss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[TeachersResponse])
async def update_teacherss_batch(
    request: TeachersBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple teacherss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} teacherss")
    
    service = TeachersService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} teacherss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=TeachersResponse)
async def update_teachers(
    id: int,
    data: TeachersUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing teachers"""
    logger.debug(f"Updating teachers {id} with data: {data}")

    service = TeachersService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Teachers with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Teachers not found")
        
        logger.info(f"Teachers {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating teachers {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating teachers {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_teacherss_batch(
    request: TeachersBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple teacherss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} teacherss")
    
    service = TeachersService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} teacherss successfully")
        return {"message": f"Successfully deleted {deleted_count} teacherss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_teachers(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single teachers by ID"""
    logger.debug(f"Deleting teachers with id: {id}")
    
    service = TeachersService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Teachers with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Teachers not found")
        
        logger.info(f"Teachers {id} deleted successfully")
        return {"message": "Teachers deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting teachers {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")