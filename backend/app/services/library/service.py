from __future__ import annotations

from dataclasses import dataclass

from app.repositories.interfaces.library import LibraryRepository


class LibraryServiceError(Exception):
    """Raised when library operations fail."""


@dataclass(slots=True)
class LibraryIssueDTO:
    issue_id: int | None
    book_id: int
    student_id: int
    fine_amount: float = 0.0


class LibraryService:
    def __init__(self, library_repository: LibraryRepository) -> None:
        self._library_repository = library_repository

    async def issue_book(self, book_id: int, student_id: int) -> LibraryIssueDTO:
        if book_id <= 0 or student_id <= 0:
            raise LibraryServiceError("Book and student identifiers must be positive")

        return LibraryIssueDTO(issue_id=None, book_id=book_id, student_id=student_id)

    async def calculate_fine(self, issue_id: int) -> float:
        if issue_id <= 0:
            raise LibraryServiceError("Issue identifier must be positive")

        return 0.0
