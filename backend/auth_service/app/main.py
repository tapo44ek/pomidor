from fastapi import FastAPI
from api.v1.endpoints.auth_endpoints import router as auth_roter
from api.v1.endpoints.user_endpoints import router as user_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(root_path='/auth')

app.include_router(auth_roter)
app.include_router(user_router)

origins = [
    "http://localhost",  # React Dev Server
    "http://127.0.0.1",
    "http://10.9.96.160:3001",
    "http://dsadgi.mlc.gov:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)