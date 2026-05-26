import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.members import Members

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class MembersService:
    """Service layer for Members operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Members]:
        """Create a new members"""
        try:
            obj = Members(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created members with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating members: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Members]:
        """Get members by ID"""
        try:
            query = select(Members).where(Members.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching members {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of memberss"""
        try:
            query = select(Members)
            count_query = select(func.count(Members.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Members, field):
                        query = query.where(getattr(Members, field) == value)
                        count_query = count_query.where(getattr(Members, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Members, field_name):
                        query = query.order_by(getattr(Members, field_name).desc())
                else:
                    if hasattr(Members, sort):
                        query = query.order_by(getattr(Members, sort))
            else:
                query = query.order_by(Members.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching members list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Members]:
        """Update members"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Members {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated members {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating members {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete members"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Members {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted members {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting members {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Members]:
        """Get members by any field"""
        try:
            if not hasattr(Members, field_name):
                raise ValueError(f"Field {field_name} does not exist on Members")
            result = await self.db.execute(
                select(Members).where(getattr(Members, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching members by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Members]:
        """Get list of memberss filtered by field"""
        try:
            if not hasattr(Members, field_name):
                raise ValueError(f"Field {field_name} does not exist on Members")
            result = await self.db.execute(
                select(Members)
                .where(getattr(Members, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Members.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching memberss by {field_name}: {str(e)}")
            raise