from repository.history_repository import HistoryRepository

class HistoryService: 
    def __init__(self, repository : HistoryRepository):
        self.repository = repository
    
    async def get_history(self):
        res = await self.repository.get_history()
        print(res)
        return res
    