from app.models.finance import OtherIncomeAccountMapper


class OtherIncomeAccountMapperService:
    def __init__(self, repository) -> None:
        self._repository = repository

    async def create(self, **payload) -> OtherIncomeAccountMapper:
        return OtherIncomeAccountMapper(**payload)
