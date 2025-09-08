"""Telemetry and logging utilities for Python services."""

import os
import time
from typing import Any, Dict, Optional
import structlog
from structlog import get_logger


# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer() if os.getenv('LOG_FORMAT') == 'json' else structlog.dev.ConsoleRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = get_logger()


class TelemetryUtils:
    """Utility functions for telemetry and monitoring."""
    
    @staticmethod
    def start_timer(operation: str, context: Optional[Dict[str, Any]] = None) -> callable:
        """Start timing an operation."""
        start_time = time.time()
        logger.info("Starting operation", operation=operation, **(context or {}))
        
        def end_timer() -> float:
            duration = time.time() - start_time
            logger.info("Completed operation", operation=operation, duration=duration, **(context or {}))
            return duration
        
        return end_timer
    
    @staticmethod
    def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
        """Log error with structured context."""
        logger.error(
            "Error occurred",
            error=str(error),
            error_type=type(error).__name__,
            **(context or {})
        )
    
    @staticmethod
    def log_info(message: str, **kwargs) -> None:
        """Log info message with context."""
        logger.info(message, **kwargs)
    
    @staticmethod
    def log_debug(message: str, **kwargs) -> None:
        """Log debug message with context."""
        logger.debug(message, **kwargs)
    
    @staticmethod
    def log_warning(message: str, **kwargs) -> None:
        """Log warning message with context."""
        logger.warning(message, **kwargs)