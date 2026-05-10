from celery import Celery
from app.core.config import settings


app = Celery("e4rth_etl", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
app.conf.task_routes = {"workers.tasks.*": {"queue": "etl"}}
