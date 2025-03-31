@echo off
chcp 65001 > nul
echo ============================================
echo        ЗАПУСК ПРОЕКТА OFS GLOBAL
echo ============================================
echo.

:: Останавливаем все процессы Python и Node, если они запущены
echo [ИНФО] Останавливаем предыдущие процессы...
taskkill /F /IM python.exe /T >nul 2>nul
taskkill /F /IM node.exe /T >nul 2>nul

:: Запускаем бэкенд в отдельном окне
echo [ИНФО] Запуск бэкенда...
start "OFS Бэкенд" cmd /c start_full_api.bat

:: Ждем 5 секунд, чтобы бэкенд успел запуститься
echo [ИНФО] Ожидание запуска бэкенда (5 секунд)...
timeout /T 5 /NOBREAK >nul

:: Запускаем фронтенд
echo [ИНФО] Запуск фронтенда...
start "OFS Фронтенд" cmd /c start_frontend.bat

echo.
echo [ИНФО] Проект запущен!
echo [ИНФО] Бэкенд:  http://localhost:8000
echo [ИНФО] Фронтенд: http://localhost:3003
echo.
echo [ИНФО] Нажмите любую клавишу, чтобы закрыть это окно.
echo [ИНФО] Процессы будут продолжать работать в отдельных окнах.
pause >nul 