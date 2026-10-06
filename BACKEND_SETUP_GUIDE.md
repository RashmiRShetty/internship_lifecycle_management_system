# 🚀 InternSmart - Backend Setup & Troubleshooting Guide

## Problem: 403 Forbidden Error

**Error:** `POST http://localhost:8080/auth/register → 403 (Forbidden)`

**Root Cause:** Backend microservices are not running or databases are not initialized.

---

## ✅ Complete Setup Steps

### 1. **Database Setup** (One-time)

Ensure PostgreSQL is running, then:

```powershell
# Navigate to project root
cd C:\Users\rashm\INTERNSHIP

# Run database setup script
psql -U postgres -f setup_databases.sql

# When prompted, enter the password configured for your local PostgreSQL user.
```

This creates 10 databases:
- `internship_auth_db` (for auth service)
- `internship_user_db` (for user service)
- ... and 8 more microservice databases

---

### 2. **Configure Backend Environment Variables**

Set these variables in each terminal before starting the backend services. Use
your own local values; do not commit them or put them in configuration files.

```powershell
$env:DB_PASSWORD = "<your PostgreSQL password>"
$env:JWT_SECRET = "<a unique, randomly generated signing secret>"
$env:MAIL_USERNAME = "<your mail account>"
$env:MAIL_PASSWORD = "<your mail app password>"
# Optional; defaults to MAIL_USERNAME
$env:MAIL_FROM = "<verified sender address>"
```

`MAIL_USERNAME` and `MAIL_PASSWORD` are needed for email features. `MAIL_FROM`
can be set if the sender address differs from the mail account. Keep the signing
secret the same for the auth service and API gateway.

### 3. **Start Backend Microservices**

Open **4 separate PowerShell terminals** and run each command:

#### Terminal 1: Eureka Server (Service Registry)
```powershell
cd C:\Users\rashm\INTERNSHIP\backend\eureka-server
mvn spring-boot:run
# Wait for: "Started EurekaServerApplication"
# Access: http://localhost:8761
```

#### Terminal 2: Auth Service
```powershell
cd C:\Users\rashm\INTERNSHIP\backend\auth-service
mvn spring-boot:run
# Wait for: "Started AuthServiceApplication" 
# Port: 8081
# Should register with Eureka
```

#### Terminal 3: API Gateway
```powershell
cd C:\Users\rashm\INTERNSHIP\backend\api-gateway
mvn spring-boot:run
```

#### Terminal 4: Chat Service
```powershell
cd C:\Users\rashm\INTERNSHIP\backend\chat-service
mvn spring-boot:run
```

#### Terminal 5: User Service
```powershell
cd C:\Users\rashm\INTERNSHIP\backend\user-service
mvn spring-boot:run
```

---

### 4. **Verify Everything is Working**

1.  Open **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)
2.  Check the **Instances currently registered with Eureka**:
    *   `AUTH-SERVICE` should be listed.
    *   `API-GATEWAY` should be listed.
    *   `CHAT-SERVICE` should be listed.
    *   `USER-SERVICE` should be listed.
3.  If `CHAT-SERVICE` is **missing**, the messaging feature will return a **503 Service Unavailable** error.

### 5. **Database Table Verification**
| Service | Database Name | Username | Password | Port |
| :--- | :--- | :--- | :--- | :--- |
| Auth Service | `internship_auth_db` | postgres | `$env:DB_PASSWORD` | 5432 |
| User Service | `internship_user_db` | postgres | `$env:DB_PASSWORD` | 5432 |
| Chat Service | `internship_chat_db` | postgres | `$env:DB_PASSWORD` | 5432 |
| ... | ... | ... | ... | ... |

**Location:** `backend/[service-name]/src/main/resources/application.yml`

---

## 🐛 Common Issues & Solutions

### Issue: Port Already in Use
```
Address already in use: bind failed on port 8080
```
**Solution:**
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill it (replace PID with actual ID)
taskkill /PID [PID] /F
```

### Issue: PostgreSQL Connection Failed
```
Unable to acquire JDBC Connection from DataSource
```
**Solution:**
- Ensure PostgreSQL is running: `pg_isready`
- Set `DB_PASSWORD` in the terminal where the service is started
- Run setup script: `psql -U postgres -f setup_databases.sql`

### Issue: Services Not Registering with Eureka
```
Failed to register with service registry
```
**Solution:**
- Ensure Eureka Server is running first
- Check all services have correct `eureka.client.service-url.defaultZone` in `application.yml`
- Should be: `http://localhost:8761/eureka/`

### Issue: CORS Error in Browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Already configured in API Gateway (`GatewayConfig.java`)
- Allows requests from `http://localhost:5173`
- Supports methods: GET, POST, PUT, DELETE, OPTIONS

---

## 📝 Service Architecture

```
┌─────────────────────────────────────────┐
│        Frontend (React)                  │
│      localhost:5173                     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      API Gateway                        │
│      localhost:8080                     │
│  (Spring Cloud Gateway + CORS)          │
└────────────┬─────────────────────────────┘
             │
┌────────────┴─────────────────────────────┐
│    Service Registry (Eureka)            │
│    localhost:8761                       │
│   (Service Discovery)                   │
└────────────┬──────────────────────────────┘
             │
    ┌────────┼────────┬────────┐
    │        │        │        │
┌───▼──┐ ┌──▼───┐ ┌──▼────┐  ...
│Auth  │ │User  │ │Internship
│8081  │ │8082  │ │8083
└──┬───┘ └──┬───┘ └──┬──────┘
   │        │        │
   └────┬───┴────┬───┘
        │        │
   ┌────▼────────▼──────┐
   │   PostgreSQL       │
   │   localhost:5432   │
   └────────────────────┘
```

---

## ✨ Quick Reference

```powershell
# Database Setup
psql -U postgres -f setup_databases.sql

# Start Services (in separate terminals)
cd backend\eureka-server && mvn spring-boot:run
cd backend\auth-service && mvn spring-boot:run
cd backend\api-gateway && mvn spring-boot:run

# Start Frontend
npm run dev

# Access Points
Eureka:     http://localhost:8761
API Gateway: http://localhost:8080
Frontend:   http://localhost:5173
Register:   http://localhost:5173/register
```

---

## 🎯 Next Steps

1. ✅ Setup PostgreSQL databases
2. ✅ Start all 4 services (Eureka, Auth, Gateway, Frontend)
3. ✅ Verify on Eureka dashboard
4. ✅ Navigate to `http://localhost:5173/register`
5. ✅ Test registration form

**Now you should NOT get 403 errors!** 🎉
