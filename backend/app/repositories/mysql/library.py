from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.library import BookIssue, LibraryItem, BookCopy, Reservation, Fine
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.library import LibraryRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLLibraryRepository(MySQLRepository[LibraryItem], LibraryRepository):
    def __init__(self, session):
        super().__init__(session, LibraryItem)

    async def find_available_books(self) -> list[LibraryItem]:
        try:
            stmt = select(LibraryItem).where(LibraryItem.available_copies > 0)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def issue_history(self) -> list[BookIssue]:
        try:
            stmt = select(BookIssue)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def issue_book(self, book_id: int, student_id: int) -> BookIssue:
        issue = BookIssue(copy_id=book_id, borrower_type="Student", borrower_id=student_id, due_on=None, status="Issued")
        return await self.create(issue)

    async def return_book(self, issue_id: int) -> BookIssue:
        issue = await self.get_by_id(issue_id)
        raise NotImplementedError

    async def calculate_fine(self, issue_id: int) -> float:
        return 0.0


class MySQLLibraryEntityRepository(MySQLRepository[LibraryItem]):
    def __init__(self, session):
        super().__init__(session, LibraryItem)


class MySQLBookCopyRepository(MySQLRepository[BookCopy]):
    def __init__(self, session):
        super().__init__(session, BookCopy)


class MySQLBookIssueRepository(MySQLRepository[BookIssue]):
    def __init__(self, session):
        super().__init__(session, BookIssue)


class MySQLReservationRepository(MySQLRepository[Reservation]):
    def __init__(self, session):
        super().__init__(session, Reservation)


class MySQLFineRepository(MySQLRepository[Fine]):
    def __init__(self, session):
        super().__init__(session, Fine)
