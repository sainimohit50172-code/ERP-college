from app.models.finance import OtherIncomeHead


class OtherIncomeHeadService:
    def __init__(self, repository) -> None:
        self._repository = repository

    async def create(self, **payload) -> OtherIncomeHead:
        return OtherIncomeHead(**payload)
