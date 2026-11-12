@echo off
echo ========================================================
echo  NEXUS Logistics Intelligence Platform
echo  Event-Driven Supply Chain & E-Commerce Control Center
echo ========================================================
echo.
echo Starting FastAPI Backend + Real-Time Enterprise UI on http://localhost:8000 ...
echo.
py -3.14 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
