@echo off
echo Stopping all Spring Boot services...

taskkill /F /IM java.exe

echo.
echo All Java services have been stopped.
pause