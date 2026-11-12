"""Add Discord nickname fields to users

Revision ID: a1b2c3d4e5f6
Revises: e03e9501593e
Create Date: 2026-11-13

NOTE: Do NOT auto-apply against production.
Apply manually after review:

  alembic upgrade head

Columns are also auto-added at runtime by core.database repair when the app starts
(local/dev). For Neon/production, prefer explicit migration after backup.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "e03e9501593e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("discord_global_name", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("discord_guild_nickname", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "discord_guild_nickname")
    op.drop_column("users", "discord_global_name")
