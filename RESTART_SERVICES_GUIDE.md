# 🚀 Services Restart Guide for Department Management

## Problem: 404 Errors on Department Endpoints

The 404 errors occur because the backend services need to be restarted to pick up the new DepartmentController and endpoints.

## Solution: Restart Required Services

### 1. Restart User Service (Required)
```powershell
# Stop any running user-service instance
# Then start it again:
cd C:\Users\rashm\INTERNSHIP\backend\user-service
mvn spring-boot:run
```

### 2. Restart Auth Service (Required for Admin Creation)
```powershell
# Stop any running auth-service instance
# Then start it again:
cd C:\Users\rashm\INTERNSHIP\backend\auth-service
mvn spring-boot:run
```

### 3. Verify Database Setup
Make sure the departments table exists in the database:
```powershell
psql -U postgres -d internship_user_db -c "\d departments"
```

If the table doesn't exist, run:
```powershell
psql -U postgres -f C:\Users\rashm\INTERNSHIP\setup_databases.sql
```

## Quick Start All Services

If you want to restart all services, use the provided batch file:
```powershell
cd C:\Users\rashm\INTERNSHIP
.\START_SERVICES.bat
```

## Verify Services are Running

1. **User Service**: http://localhost:8082
2. **Auth Service**: http://localhost:8081
3. **API Gateway**: http://localhost:8080
4. **Eureka Server**: http://localhost:8761

## Test the New Endpoints

Once services are restarted, test:
- **Departments API**: http://localhost:8080/users/departments
- **Create Admin API**: POST http://localhost:8080/auth/admin/create-admin

## Troubleshooting

### If User Service fails to start:
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -U postgres -l`
- Check port 8082 is not in use: `netstat -ano | findstr :8082`

### If Auth Service fails to start:
- Check port 8081 is not in use
- Verify internship_auth_db exists
- Check database credentials in application.yml

### If 404 errors persist:
- Clear browser cache
- Check API Gateway routing configuration
- Verify services are registered in Eureka: http://localhost:8761

## Expected Behavior After Restart

After restarting the services:
1. ✅ `/users/departments` should return list of departments
2. ✅ Department Management Modal should load without errors
3. ✅ Create Department button should work
4. ✅ Delete Department buttons should be prominent and functional
4. ✅ Admin Creation Modal should work properly