"""Database utilities for Python services."""

import os
from typing import Optional
import psycopg
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from .telemetry import logger


class DatabaseClient:
    """Database client for PostgreSQL operations."""
    
    def __init__(self, connection_string: Optional[str] = None):
        self.connection_string = connection_string or os.getenv('DATABASE_URL')
        if not self.connection_string:
            raise ValueError("DATABASE_URL environment variable not set")
        
        self._engine: Optional[Engine] = None
    
    @property
    def engine(self) -> Engine:
        """Get SQLAlchemy engine instance."""
        if self._engine is None:
            self._engine = create_engine(self.connection_string)
        return self._engine
    
    async def execute_query(self, query: str, params: Optional[dict] = None):
        """Execute a SQL query with optional parameters."""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text(query), params or {})
                conn.commit()
                return result
        except Exception as e:
            logger.error(f"Database query failed: {e}", query=query, params=params)
            raise
    
    async def health_check(self) -> bool:
        """Check database connection health."""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False


class DatabaseUtils:
    """Utility functions for common database operations."""
    
    @staticmethod
    def get_connection_string() -> str:
        """Get database connection string from environment."""
        connection_string = os.getenv('DATABASE_URL')
        if not connection_string:
            raise ValueError("DATABASE_URL environment variable not set")
        return connection_string
    
    @staticmethod
    async def test_connection(connection_string: str) -> bool:
        """Test database connection."""
        try:
            client = DatabaseClient(connection_string)
            return await client.health_check()
        except Exception:
            return False