from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.library import BookIssue, LibraryItem
from app.repositories.interfaces.base import BaseRepository


class LibraryRepository(BaseRepository[LibraryItem], ABC):
    @abstractmethod
    async def issue_book(self, book_id: int, student_id: int) -> BookIssue:
        raise NotImplementedError

    @abstractmethod
    async def return_book(self, issue_id: int) -> BookIssue:
        raise NotImplementedError

    @abstractmethod
    async def calculate_fine(self, issue_id: int) -> float:
        raise NotImplementedError
