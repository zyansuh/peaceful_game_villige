"""Teacher slot sync when application status changes."""

import logging
from typing import Optional

from services.teachers import TeachersService

logger = logging.getLogger(__name__)

ACTIVE_ASSIGNMENT_STATUSES = frozenset({"approved"})


async def assign_teacher_slot(teachers_service: TeachersService, teacher_id: int) -> None:
    teacher = await teachers_service.get_by_id(teacher_id)
    if not teacher:
        return
    new_current = teacher.current_students + 1
    update_data: dict = {"current_students": new_current}
    if new_current >= teacher.max_students:
        update_data["status"] = "closed"
    await teachers_service.update(teacher_id, update_data)
    logger.info("Assigned teacher %s slot (%s/%s)", teacher_id, new_current, teacher.max_students)


async def release_teacher_slot(teachers_service: TeachersService, teacher_id: int) -> None:
    teacher = await teachers_service.get_by_id(teacher_id)
    if not teacher:
        return
    new_current = max(0, teacher.current_students - 1)
    update_data: dict = {"current_students": new_current}
    if teacher.status == "closed" and new_current < teacher.max_students:
        update_data["status"] = "recruiting"
    await teachers_service.update(teacher_id, update_data)
    logger.info("Released teacher %s slot (%s/%s)", teacher_id, new_current, teacher.max_students)


async def sync_teacher_slot_on_status_change(
    teachers_service: TeachersService,
    teacher_id: int,
    old_status: Optional[str],
    new_status: Optional[str],
) -> None:
    was_active = old_status in ACTIVE_ASSIGNMENT_STATUSES
    is_active = new_status in ACTIVE_ASSIGNMENT_STATUSES
    if not was_active and is_active:
        await assign_teacher_slot(teachers_service, teacher_id)
    elif was_active and not is_active:
        await release_teacher_slot(teachers_service, teacher_id)
