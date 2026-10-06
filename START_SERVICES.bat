@echo off
SET ROOT=%~dp0

echo ===============================================
echo Starting Internship Management Microservices
echo ===============================================

REM ==========================
REM Service Registry
REM ==========================
start "Service Registry" cmd /k "cd /d "%ROOT%backend\service-registry" && mvn spring-boot:run"
timeout /t 15 /nobreak >nul

REM ==========================
REM API Gateway
REM ==========================
start "API Gateway" cmd /k "cd /d "%ROOT%backend\api-gateway" && mvn spring-boot:run"

REM ==========================
REM Auth Service
REM ==========================
start "Auth Service" cmd /k "cd /d "%ROOT%backend\auth-service" && mvn spring-boot:run"

REM ==========================
REM User Service
REM ==========================
start "User Service" cmd /k "cd /d "%ROOT%backend\user-service" && mvn spring-boot:run"

REM ==========================
REM Internship Service
REM ==========================
start "Internship Service" cmd /k "cd /d "%ROOT%backend\internship-service" && mvn spring-boot:run"

REM ==========================
REM Application Service
REM ==========================
start "Application Service" cmd /k "cd /d "%ROOT%backend\application-service" && mvn spring-boot:run"

REM ==========================
REM Report Service
REM ==========================
start "Report Service" cmd /k "cd /d "%ROOT%backend\report-service" && mvn spring-boot:run"

REM ==========================
REM Meeting Service
REM ==========================
start "Meeting Service" cmd /k "cd /d "%ROOT%backend\meeting-service" && mvn spring-boot:run"

REM ==========================
REM Certificate Service
REM ==========================
start "Certificate Service" cmd /k "cd /d "%ROOT%backend\certificate-service" && mvn spring-boot:run"

REM ==========================
REM Notification Service
REM ==========================
start "Notification Service" cmd /k "cd /d "%ROOT%backend\notification-service" && mvn spring-boot:run"

REM ==========================
REM Chat Service
REM ==========================
start "Chat Service" cmd /k "cd /d "%ROOT%backend\chat-service" && mvn spring-boot:run"

REM ==========================
REM Analytics Service
REM ==========================
start "Analytics Service" cmd /k "cd /d "%ROOT%backend\analytics-service" && mvn spring-boot:run"

REM ==========================
REM Recommendation Service
REM ==========================
start "Recommendation Service" cmd /k "cd /d "%ROOT%backend\recommendation-service" && mvn spring-boot:run"

echo.
echo ===============================================
echo All Microservices are Starting...
echo ===============================================
echo.
echo Service Registry : http://localhost:8761
echo API Gateway      : http://localhost:8080
echo.
echo Please wait 30-60 seconds for all services to start.
echo ===============================================

pause