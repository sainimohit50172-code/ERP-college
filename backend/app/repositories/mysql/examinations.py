from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.examinations import Exam, ExamResult
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.examinations import ExaminationRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLExaminationRepository(MySQLRepository[Exam], ExaminationRepository):
    def __init__(self, session):
        super().__init__(session, Exam)

    async def get_results_for_exam(self, exam_id: int) -> list[ExamResult]:
        try:
            stmt = select(ExamResult).where(ExamResult.exam_id == exam_id)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def submit_result(self, result: ExamResult) -> ExamResult:
        try:
            self.session.add(result)
            await self._run_sync(lambda: self.session.commit())
            await self._run_sync(lambda: self.session.refresh(result))
            return result
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc
