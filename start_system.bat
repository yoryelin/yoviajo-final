@echo off
echo ==========================================
echo       INICIANDO SISTEMA YO VIAJO
echo ==========================================

echo.
echo [1/3] Iniciando Backend (Puerto 8003)...
start "YoViajo Backend" cmd /k "cd backend && call venv\Scripts\activate && python run.py"

echo.
echo [2/3] Iniciando Frontend (Vite)...
start "YoViajo Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [3/3] Abriendo navegador...
timeout /t 5 >nul
start http://localhost:5173

echo.
echo ==========================================
echo    SISTEMA INICIADO CORRECTAMENTE
echo ==========================================
echo.
pause
