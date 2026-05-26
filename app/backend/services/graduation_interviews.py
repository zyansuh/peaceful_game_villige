import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.graduation_interviews import Graduation_interviews

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Graduation_interviewsService:
    """Service layer for Graduation_interviews operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Graduation_interviews]:
        """Create a new graduation_interviews"""
        try:
            if user_id:
                data['user_id'] = user_id
            obj = Graduation_interviews(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created graduation_interviews with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating graduation_interviews: {str(e)}")
            raise

    async def check_ownership(self, obj_id: int, user_id: str) -> bool:
        """Check if user owns this record"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            return obj is not None
        except Exception as e:
            logger.error(f"Error checking ownership for graduation_interviews {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[Graduation_interviews]:
        """Get graduation_interviews by ID (user can only see their own records)"""
        try:
            query = select(Graduation_interviews).where(Graduation_interviews.id == obj_id)
            if user_id:
                query = query.where(Graduation_interviews.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching graduation_interviews {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of graduation_interviewss (user can only see their own records)"""
        try:
            query = select(Graduation_interviews)
            count_query = select(func.count(Graduation_interviews.id))
            
            if user_id:
                query = query.where(Graduation_interviews.user_id == user_id)
                count_query = count_query.where(Graduation_interviews.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Graduation_interviews, field):
                        query = query.where(getattr(Graduation_interviews, field) == value)
                        count_query = count_query.where(getattr(Graduation_interviews, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Graduation_interviews, field_name):
                        query = query.order_by(getattr(Graduation_interviews, field_name).desc())
                else:
                    if hasattr(Graduation_interviews, sort):
                        query = query.order_by(getattr(Graduation_interviews, sort))
            else:
                query = query.order_by(Graduation_interviews.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching graduation_interviews list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Graduation_interviews]:
        """Update graduation_interviews (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Graduation_interviews {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated graduation_interviews {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating graduation_interviews {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete graduation_interviews (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Graduation_interviews {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted graduation_interviews {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting graduation_interviews {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Graduation_interviews]:
        """Get graduation_interviews by any field"""
        try:
            if not hasattr(Graduation_interviews, field_name):
                raise ValueError(f"Field {field_name} does not exist on Graduation_interviews")
            result = await self.db.execute(
                select(Graduation_interviews).where(getattr(Graduation_interviews, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching graduation_interviews by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Graduation_interviews]:
        """Get list of graduation_interviewss filtered by field"""
        try:
            if not hasattr(Graduation_interviews, field_name):
                raise ValueError(f"Field {field_name} does not exist on Graduation_interviews")
            result = await self.db.execute(
                select(Graduation_interviews)
                .where(getattr(Graduation_interviews, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Graduation_interviews.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching graduation_interviewss by {field_name}: {str(e)}")
            raise