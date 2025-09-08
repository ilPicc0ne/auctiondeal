"""Validation utilities for Python services."""

import re
from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, ValidationError
from .telemetry import logger


class ValidationUtils:
    """Common validation utilities."""
    
    UUID_PATTERN = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    
    @classmethod
    def is_valid_uuid(cls, value: str) -> bool:
        """Check if string is valid UUID."""
        return bool(cls.UUID_PATTERN.match(value))
    
    @classmethod
    def is_valid_email(cls, email: str) -> bool:
        """Check if string is valid email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @classmethod
    def is_valid_date_string(cls, date_string: str) -> bool:
        """Check if string is valid ISO date format."""
        try:
            datetime.fromisoformat(date_string.replace('Z', '+00:00'))
            return True
        except (ValueError, TypeError):
            return False
    
    @classmethod
    def validate_model(cls, model_class: type[BaseModel], data: Dict[str, Any]) -> tuple[bool, Optional[BaseModel], Optional[str]]:
        """Validate data against Pydantic model."""
        try:
            model_instance = model_class(**data)
            return True, model_instance, None
        except ValidationError as e:
            error_msg = f"Validation failed: {e}"
            logger.warning("Model validation failed", error=error_msg, data=data)
            return False, None, error_msg
        except Exception as e:
            error_msg = f"Unexpected validation error: {e}"
            logger.error("Unexpected validation error", error=error_msg, data=data)
            return False, None, error_msg