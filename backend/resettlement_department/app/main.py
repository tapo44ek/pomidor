import time

from api.v1.router import router
from core.logger import logger
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD", "TRACE", "CONNECT"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    logger.info(f"→ {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.error(f"! {request.method} {request.url.path} failed: {str(exc)}")
        raise
    
    process_time = (time.time() - start_time) * 1000
    logger.info(f"← {request.method} {request.url.path} | Status: {response.status_code} | {process_time:.0f}ms")
    
    return response


app.include_router(router)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Application started")