import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.graduation_interviews import Graduation_interviewsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/graduation_interviews", tags=["graduation_interviews"])


# ---------- Pydantic Schemas ----------
class Graduation_interviewsData(BaseModel):
    """Entity data schema (for create/update)"""
    teacher_id: int
    teacher_name: str
    class_name: str
    answer1: str
    answer2: str
    answer3: str = None


class Graduation_interviewsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    teacher_id: Optional[int] = None
    teacher_name: Optional[str] = None
    class_name: Optional[str] = None
    answer1: Optional[str] = None
    answer2: Optional[str] = None
    answer3: Optional[str] = None


class Graduation_interviewsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    teacher_id: int
    teacher_name: str
    class_name: str
    answer1: str
    answer2: str
    answer3: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Graduation_interviewsListResponse(BaseModel):
    """List response schema"""
    items: List[Graduation_interviewsResponse]
    total: int
    skip: int
    limit: int


class Graduation_interviewsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Graduation_interviewsData]


class Graduation_interviewsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Graduation_interviewsUpdateData


class Graduation_interviewsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Graduation_interviewsBatchUpdateItem]


class Graduation_interviewsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Graduation_interviewsListResponse)
async def query_graduation_interviewss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query graduation_interviewss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying graduation_interviewss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Graduation_interviewsService(db)
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
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} graduation_interviewss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying graduation_interviewss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Graduation_interviewsListResponse)
async def query_graduation_interviewss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query graduation_interviewss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying graduation_interviewss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Graduation_interviewsService(db)
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
        logger.debug(f"Found {result['total']} graduation_interviewss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying graduation_interviewss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Graduation_interviewsResponse)
async def get_graduation_interviews(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single graduation_interviews by ID (user can only see their own records)"""
    logger.debug(f"Fetching graduation_interviews with id: {id}, fields={fields}")
    
    service = Graduation_interviewsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Graduation_interviews with id {id} not found")
            raise HTTPException(status_code=404, detail="Graduation_interviews not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching graduation_interviews {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Graduation_interviewsResponse, status_code=201)
async def create_graduation_interviews(
    data: Graduation_interviewsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new graduation_interviews"""
    logger.debug(f"Creating new graduation_interviews with data: {data}")
    
    service = Graduation_interviewsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create graduation_interviews")
        
        logger.info(f"Graduation_interviews created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating graduation_interviews: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating graduation_interviews: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Graduation_interviewsResponse], status_code=201)
async def create_graduation_interviewss_batch(
    request: Graduation_interviewsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple graduation_interviewss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} graduation_interviewss")
    
    service = Graduation_interviewsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} graduation_interviewss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Graduation_interviewsResponse])
async def update_graduation_interviewss_batch(
    request: Graduation_interviewsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple graduation_interviewss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} graduation_interviewss")
    
    service = Graduation_interviewsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            user_id_filter = None if current_user.role == "admin" else str(current_user.id)
            result = await service.update(item.id, update_dict, user_id=user_id_filter)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} graduation_interviewss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Graduation_interviewsResponse)
async def update_graduation_interviews(
    id: int,
    data: Graduation_interviewsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing graduation_interviews (requires ownership, admins can update any)"""
    logger.debug(f"Updating graduation_interviews {id} with data: {data}")

    service = Graduation_interviewsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        user_id_filter = None if current_user.role == "admin" else str(current_user.id)
        result = await service.update(id, update_dict, user_id=user_id_filter)
        if not result:
            logger.warning(f"Graduation_interviews with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Graduation_interviews not found")
        
        logger.info(f"Graduation_interviews {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating graduation_interviews {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating graduation_interviews {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_graduation_interviewss_batch(
    request: Graduation_interviewsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple graduation_interviewss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} graduation_interviewss")
    
    service = Graduation_interviewsService(db)
    deleted_count = 0
    
    try:
        user_id_filter = None if current_user.role == "admin" else str(current_user.id)
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=user_id_filter)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} graduation_interviewss successfully")
        return {"message": f"Successfully deleted {deleted_count} graduation_interviewss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_graduation_interviews(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single graduation_interviews by ID (requires ownership, admins can delete any)"""
    logger.debug(f"Deleting graduation_interviews with id: {id}")
    
    service = Graduation_interviewsService(db)
    try:
        user_id_filter = None if current_user.role == "admin" else str(current_user.id)
        success = await service.delete(id, user_id=user_id_filter)
        if not success:
            logger.warning(f"Graduation_interviews with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Graduation_interviews not found")
        
        logger.info(f"Graduation_interviews {id} deleted successfully")
        return {"message": "Graduation_interviews deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting graduation_interviews {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")