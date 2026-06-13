import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.members import MembersService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/members", tags=["members"])


# ---------- Pydantic Schemas ----------
class MembersData(BaseModel):
    """Entity data schema (for create/update)"""
    username: str
    password: str


class MembersUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    username: Optional[str] = None
    password: Optional[str] = None


class MembersResponse(BaseModel):
    """Entity response schema"""
    id: int
    username: str
    password: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MembersListResponse(BaseModel):
    """List response schema"""
    items: List[MembersResponse]
    total: int
    skip: int
    limit: int


class MembersBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[MembersData]


class MembersBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: MembersUpdateData


class MembersBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[MembersBatchUpdateItem]


class MembersBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
class MembersRegisterRequest(BaseModel):
    """Registration request schema"""
    username: str
    password: str


@router.post("/register")
async def register_member(
    data: MembersRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Deprecated: use Discord login instead."""
    raise HTTPException(
        status_code=410,
        detail="닉네임·비밀번호 회원가입은 종료되었습니다. Discord 로그인을 이용해 주세요.",
    )


@router.get("", response_model=MembersListResponse)
async def query_memberss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query memberss with filtering, sorting, and pagination"""
    logger.debug(f"Querying memberss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = MembersService(db)
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
        logger.debug(f"Found {result['total']} memberss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying memberss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=MembersListResponse)
async def query_memberss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query memberss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying memberss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = MembersService(db)
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
        logger.debug(f"Found {result['total']} memberss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying memberss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=MembersResponse)
async def get_members(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single members by ID"""
    logger.debug(f"Fetching members with id: {id}, fields={fields}")
    
    service = MembersService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Members with id {id} not found")
            raise HTTPException(status_code=404, detail="Members not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching members {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=MembersResponse, status_code=201)
async def create_members(
    data: MembersData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new members"""
    logger.debug(f"Creating new members with data: {data}")
    
    service = MembersService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create members")
        
        logger.info(f"Members created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating members: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating members: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[MembersResponse], status_code=201)
async def create_memberss_batch(
    request: MembersBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple memberss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} memberss")
    
    service = MembersService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} memberss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[MembersResponse])
async def update_memberss_batch(
    request: MembersBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple memberss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} memberss")
    
    service = MembersService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} memberss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=MembersResponse)
async def update_members(
    id: int,
    data: MembersUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing members"""
    logger.debug(f"Updating members {id} with data: {data}")

    service = MembersService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Members with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Members not found")
        
        logger.info(f"Members {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating members {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating members {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_memberss_batch(
    request: MembersBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple memberss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} memberss")
    
    service = MembersService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} memberss successfully")
        return {"message": f"Successfully deleted {deleted_count} memberss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_members(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single members by ID"""
    logger.debug(f"Deleting members with id: {id}")
    
    service = MembersService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Members with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Members not found")
        
        logger.info(f"Members {id} deleted successfully")
        return {"message": "Members deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting members {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")