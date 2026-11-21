from types import TracebackType
from typing import Optional, Type
from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    session: Session

    def __enter__(self) -> "UnitOfWork":
        self.session = session_factory()
        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType],
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()