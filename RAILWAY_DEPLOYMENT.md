# Railway deployment

This repository can be deployed from Railway as a set of services. The app
uses a React frontend, 13 Java/Spring Boot services, a Python AI service, and
PostgreSQL. That is 15 application services plus the database, so check
Railway's current pricing and resource limits before deploying all services.
The Python AI service in particular needs additional memory and downloads
machine-learning models on startup. This guide prepares the configuration; it
does not create Railway resources or move any local database records.

## 1. Create the PostgreSQL service

Create one Railway PostgreSQL service and name it `Postgres`. The setup script
creates 11 logical databases inside that PostgreSQL instance, one for each
data-owning Java service. Run `setup_databases.sql` once against the hosted
instance, connecting as its database owner. For example, from PowerShell with
the PostgreSQL client installed:

```powershell
$env:PGSSLMODE = "require"
psql -h <host> -p <port> -U <user> -d <default-database> -W -v ON_ERROR_STOP=1 -f .\setup_databases.sql
Remove-Item Env:PGSSLMODE
```

Use the host, port, user, and default database shown in Railway's PostgreSQL
connection settings. `-W` prompts for the password instead of putting it in the
command. The script creates databases and is not intended to be run repeatedly.

The app services connect with `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`. For
each database-backed service, set these in that Railway service's Variables.
If the PostgreSQL service is named `Postgres`, Railway variable references can
be used for its connection details:

```text
DB_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/<database-name>?sslmode=require
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
```

Set `<database-name>` to the service's database from this table:

| Railway service | Database |
| --- | --- |
| `auth-service` | `internship_auth_db` |
| `user-service` | `internship_user_db` |
| `internship-service` | `internship_db` |
| `application-service` | `internship_application_db` |
| `report-service` | `internship_report_db` |
| `meeting-service` | `internship_meeting_db` |
| `certificate-service` | `internship_certificate_db` |
| `chat-service` | `internship_chat_db` |
| `notification-service` | `internship_notification_db` |
| `analytics-service` | `internship_analytics_db` |
| `recommendation-service` | `internship_recommendation_db` |

Do not put database passwords or connection URLs containing credentials in Git,
source files, screenshots, or chat messages. Add them only as Railway Variables.

## 2. Create the Java services

For each Java service below, create a Railway service from this GitHub
repository. In Settings, set its Root Directory to `/backend`, its Build
Command and Start Command as shown, and its watch paths to `/backend/**`.
Railway can then build the selected Maven module and its parent from the
monorepo.

| Service | Build Command | Start Command |
| --- | --- | --- |
| `service-registry` | `mvn -pl service-registry -am -DskipTests package` | `java -jar service-registry/target/service-registry-0.0.1-SNAPSHOT.jar` |
| `api-gateway` | `mvn -pl api-gateway -am -DskipTests package` | `java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar` |
| `auth-service` | `mvn -pl auth-service -am -DskipTests package` | `java -jar auth-service/target/auth-service-0.0.1-SNAPSHOT.jar` |
| `user-service` | `mvn -pl user-service -am -DskipTests package` | `java -jar user-service/target/user-service-0.0.1-SNAPSHOT.jar` |
| `internship-service` | `mvn -pl internship-service -am -DskipTests package` | `java -jar internship-service/target/internship-service-0.0.1-SNAPSHOT.jar` |
| `application-service` | `mvn -pl application-service -am -DskipTests package` | `java -jar application-service/target/application-service-0.0.1-SNAPSHOT.jar` |
| `report-service` | `mvn -pl report-service -am -DskipTests package` | `java -jar report-service/target/report-service-0.0.1-SNAPSHOT.jar` |
| `meeting-service` | `mvn -pl meeting-service -am -DskipTests package` | `java -jar meeting-service/target/meeting-service-0.0.1-SNAPSHOT.jar` |
| `certificate-service` | `mvn -pl certificate-service -am -DskipTests package` | `java -jar certificate-service/target/certificate-service-0.0.1-SNAPSHOT.jar` |
| `chat-service` | `mvn -pl chat-service -am -DskipTests package` | `java -jar chat-service/target/chat-service-0.0.1-SNAPSHOT.jar` |
| `notification-service` | `mvn -pl notification-service -am -DskipTests package` | `java -jar notification-service/target/notification-service-0.0.1-SNAPSHOT.jar` |
| `analytics-service` | `mvn -pl analytics-service -am -DskipTests package` | `java -jar analytics-service/target/analytics-service-0.0.1-SNAPSHOT.jar` |
| `recommendation-service` | `mvn -pl recommendation-service -am -DskipTests package` | `java -jar recommendation-service/target/recommendation-service-0.0.1-SNAPSHOT.jar` |

Deploy `service-registry` first. In every other Java service, set
`EUREKA_SERVER_URL` to the service registry's Railway private address, ending
with `/eureka/`. Set or verify the service's `PORT` against its networking
settings so Spring Boot listens on the port Railway routes to. Railway private
network addresses are for service-to-service traffic; do not create public
domains for the database, registry, or internal microservices.

Add these service-specific variables:

| Service(s) | Variables |
| --- | --- |
| `auth-service`, `api-gateway` | `JWT_SECRET` (the same strong, randomly generated value in both) |
| `auth-service`, `notification-service` | `MAIL_USERNAME`, `MAIL_PASSWORD` |
| `notification-service` | Optional `MAIL_FROM` if the sender differs from `MAIL_USERNAME` |
| `api-gateway` | `CORS_ALLOWED_ORIGIN` set to the frontend's HTTPS origin, with no path |
| `api-gateway`, `recommendation-service` | `AI_MATCHER_URL` set to the Python AI service's private address, for example `http://<private-host>:<port>` |

The gateway is the only Java service that should have a public domain. Its
`PORT` must match the port selected as the domain's target port in Railway.

## 3. Create the Python AI service

Create a Railway service from the same repository and set its Root Directory to
`/backend/python-ai-matcher`. Use this Start Command:

```text
gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120 app:app
```

Keep the Python service private. The frontend's AI requests are routed through
the public API gateway under `/ai/`, and the recommendation service calls the
private AI service directly. The AI dependencies download machine-learning
models at startup; allow for a longer first start and check Railway's memory,
CPU, and build limits before enabling this feature.

The `/ai/` gateway route is publicly reachable. Add authentication and
rate-limiting before using the AI endpoints with untrusted traffic.

## 4. Create the frontend service

Create a Railway service from the same repository with Root Directory
`/frontend`. Use `npm run build` as the Build Command and `npm start` as the
Start Command. Add these Variables before the frontend build:

```text
VITE_API_BASE_URL=https://<api-gateway-domain>
VITE_AI_MATCHER_URL=https://<api-gateway-domain>/ai
```

The `VITE_` values are compiled into public browser code; they must not contain
secrets. After Railway assigns the gateway's public domain, use that exact
HTTPS origin as `CORS_ALLOWED_ORIGIN` in `api-gateway`.

## 5. Start-up and data notes

Use Railway's Deployments and Logs views to confirm that PostgreSQL is ready,
the registry is available, the services register with Eureka, the gateway
routes requests, and the frontend can log in and load data.

New online databases start empty. The local database is not copied by GitHub or
by deploying the app. If existing local records need to be preserved, export
and import each PostgreSQL database separately; never commit database dumps to
the repository.

The database stores application records, but uploaded resumes, chat files, and
task-submission attachments are written to service-local folders in this
project. Railway's container filesystem is not a durable file store, so those
uploads can disappear after a redeploy or restart. Add external object storage
and migrate these upload paths before relying on stored files in production.
