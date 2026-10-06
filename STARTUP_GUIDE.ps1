# InternSmart Backend Startup Guide
# Run this to start all microservices

## Step 1: Setup PostgreSQL Databases
Write-Host "Step 1: Setting up PostgreSQL Databases..." -ForegroundColor Green
Write-Host "Running: psql -U postgres -f setup_databases.sql"
Write-Host "Enter your local PostgreSQL password when prompted; do not store it in this script."
Write-Host ""

# Uncomment and run this line when ready:
# psql -U postgres -f "$PSScriptRoot\setup_databases.sql"

## Step 2: Start Services in Order
Write-Host "Step 2: Starting Microservices..." -ForegroundColor Green
Write-Host ""

# Service Registry (Eureka Server)
Write-Host "[Terminal 1] Starting Eureka Server..." -ForegroundColor Cyan
Write-Host "Command: cd backend\eureka-server && mvn spring-boot:run"
Write-Host ""

# Auth Service
Write-Host "[Terminal 2] Starting Auth Service..." -ForegroundColor Cyan
Write-Host "Command: cd backend\auth-service && mvn spring-boot:run"
Write-Host ""

# API Gateway
Write-Host "[Terminal 3] Starting API Gateway..." -ForegroundColor Cyan
Write-Host "Command: cd backend\api-gateway && mvn spring-boot:run"
Write-Host ""

## Step 3: Start Frontend
Write-Host "[Terminal 4] Starting Frontend..." -ForegroundColor Cyan
Write-Host "Command: npm run dev"
Write-Host ""

Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "Eureka Registry:  http://localhost:8761" -ForegroundColor White
Write-Host "API Gateway:      http://localhost:8080" -ForegroundColor White
Write-Host "Auth Service:     http://localhost:8081" -ForegroundColor White
Write-Host "Chat Service:     http://localhost:8088" -ForegroundColor White
Write-Host "Frontend App:     http://localhost:5173" -ForegroundColor White
Write-Host "Register Page:    http://localhost:5173/register" -ForegroundColor White
Write-Host "===============================================" -ForegroundColor Yellow
