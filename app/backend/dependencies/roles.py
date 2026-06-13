"""User role constants and helpers."""

STAFF_ROLES = frozenset({"admin", "teacher"})
ADMIN_ROLE = "admin"
TEACHER_STAFF_ROLE = "teacher"
USER_ROLE = "user"

VALID_ROLES = frozenset({USER_ROLE, TEACHER_STAFF_ROLE, ADMIN_ROLE})


def is_staff_role(role: str | None) -> bool:
    return role in STAFF_ROLES


def is_admin_role(role: str | None) -> bool:
    return role == ADMIN_ROLE
