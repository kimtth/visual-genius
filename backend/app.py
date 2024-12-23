import os
import uvicorn

from fastapi.responses import FileResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from dotenv import load_dotenv

from router.user import router as user_router
from router.category import router as category_router
from router.image import router as image_router

app = FastAPI()
load_dotenv(verbose=False)

# TODO: Development purpose only, remove it later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(category_router)
app.include_router(image_router)

directory_path = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(directory_path, "public")


# The @app.get("/{page}") approach was not able to handle the static files. so that, the routes declared each by each.
@app.get("/")
async def redirect_gen():
    # RedirectResponse(url="/index.html")
    return FileResponse(f"{static_path}/index.html")


@app.get("/gen")
async def redirect_gen():
    return FileResponse(f"{static_path}/gen.html")


@app.get("/rtn")
async def redirect_rtn():
    return FileResponse(f"{static_path}/rtn.html")


@app.get("/home")
async def redirect_home():
    return FileResponse(f"{static_path}/home.html")


@app.get("/motion")
async def redirect_home():
    return FileResponse(f"{static_path}/motion.html")


# Mount static files from the public directory at the root URL path (/)
"""
 !Important: mount the static files after all your API route definitions.
 The line app.mount("/static", StaticFiles(directory="static"), name="static") should be placed after all your API route definitions. 
 This is because FastAPI processes routes and mounts in the order they are declared. If you declare the static mount first, 
 FastAPI will try to find a matching static file for every request, before falling back to the dynamic routes.
"""

app.mount("/", StaticFiles(directory=static_path), name="public")


if __name__ == "__main__":
    if os.getenv("ENV_TYPE") == "dev":
        # app:app == filename:app <= FastAPI()
        uvicorn.run(app="app:app", host="127.0.0.1", port=5000)
    else:
        # Azure App service uses 8000 as default port internally.
        uvicorn.run(app="app:app", host="0.0.0.0", workers=4)
