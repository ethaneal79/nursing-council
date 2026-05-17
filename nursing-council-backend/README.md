# Meghalaya State Nursing Council — Full Stack Setup Guide

## Project Overview

| Layer     | Technology                      |
|-----------|---------------------------------|
| Frontend  | React (existing project)        |
| Backend   | Spring Boot 3.2.5 · Java 21     |
| Database  | PostgreSQL 16                   |
| Migration | Flyway                          |
| Auth      | Spring Security (stateless JWT) |

---

## 1 · Prerequisites

| Tool          | Version  | Download                          |
|---------------|----------|-----------------------------------|
| JDK           | 21+      | https://adoptium.net              |
| Maven         | 3.9+     | https://maven.apache.org          |
| PostgreSQL    | 15 or 16 | https://www.postgresql.org        |
| Eclipse IDE   | 2024-03+ | https://www.eclipse.org           |
| Node.js       | 20+      | https://nodejs.org                |

---

## 2 · Database Setup

Open **pgAdmin** or **psql** and run:

```sql
CREATE USER msnc_user WITH PASSWORD 'msnc_password';
CREATE DATABASE msnc_db OWNER msnc_user;
GRANT ALL PRIVILEGES ON DATABASE msnc_db TO msnc_user;
```

Flyway will automatically create all tables when the Spring Boot app starts for the first time.

---

## 3 · Import Backend into Eclipse

1. Open Eclipse → **File → Import → Maven → Existing Maven Projects**
2. Set root directory to the **`nursing-council-backend/`** folder
3. Click **Finish** — Eclipse downloads all dependencies automatically
4. Wait for the Maven build to complete (watch the bottom status bar)

### Configure environment variables in Eclipse

1. In **Package Explorer**, right-click `NursingCouncilApplication.java`
2. **Run As → Run Configurations…**
3. Select the configuration → **Environment** tab → **New**

Add these variables:

| Name          | Value         |
|---------------|---------------|
| DB_USERNAME   | msnc_user     |
| DB_PASSWORD   | msnc_password |
| JWT_SECRET    | any-256-bit-string-here |
| UPLOAD_DIR    | C:/msnc-uploads  *(or any folder)* |

4. Click **Run** — Spring Boot starts on `http://localhost:8080`

You should see in the console:
```
Flyway: Migrating schema "public" to version 1 - initial schema
Started NursingCouncilApplication in X.XXX seconds
```

---

## 4 · Frontend Setup

```bash
# In the nursing-council (React) folder:
npm install axios          # only new dependency needed

# Create your local env file
cp .env.example .env.local
# .env.local already points to http://localhost:8080/api
```

### Replace / merge files

Copy these files from `src/react/` into your React project's matching paths:

```
src/react/services/api.js           → src/services/api.js          (NEW)
src/react/pages/RegisterPage.js     → src/pages/RegisterPage.js     (REPLACE)
src/react/pages/RenewalPage.js      → src/pages/RenewalPage.js      (REPLACE)
src/react/pages/StatusPage.js       → src/pages/StatusPage.js       (REPLACE)
src/react/pages/VerifyPage.js       → src/pages/VerifyPage.js       (REPLACE)
src/react/components/home/NewsSection.js → src/components/home/NewsSection.js (REPLACE)
```

Then start the React dev server:
```bash
npm start    # opens http://localhost:3000
```

---

## 5 · API Endpoints Reference

All endpoints are prefixed with `/api` (from `application.yml`).

### Registration
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/registration` | Submit new registration |
| POST | `/api/registration/{ref}/documents?documentType=PHOTOGRAPH` | Upload a document |

### Renewal
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/renewal/verify?registrationNumber=&mobile=&fullName=` | Verify nurse before renewal |
| POST | `/api/renewal` | Submit renewal application |
| POST | `/api/renewal/{ref}/documents?documentType=REFRESHER_CERTIFICATE` | Upload renewal document |

### Status & Verification
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/status/track` | Track application by reference + mobile |
| POST | `/api/verify` | Verify certificate by reg number |

### Notices
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notices` | All active notices |
| GET | `/api/notices/ticker` | Ticker-only notices |

---

## 6 · Document Types (for uploads)

| Enum Value              | Used for         |
|-------------------------|------------------|
| `PHOTOGRAPH`            | Registration     |
| `IDENTITY_PROOF`        | Registration     |
| `COURSE_CERTIFICATE`    | Registration     |
| `MARKSHEET`             | Registration     |
| `INTERNSHIP_CERTIFICATE`| Registration     |
| `CHARACTER_CERTIFICATE` | Registration     |
| `REFRESHER_CERTIFICATE` | Renewal          |
| `ID_PROOF_RENEWAL`      | Renewal          |

---

## 7 · Running with Docker (optional)

If you have Docker Desktop installed:

```bash
# from the nursing-council-backend/ folder
docker-compose up --build
```

This starts PostgreSQL + Spring Boot + React all at once.

---

## 8 · Project File Structure

```
nursing-council-backend/
├── pom.xml
├── Dockerfile
├── docker-compose.yml
└── src/
    └── main/
        ├── java/com/msnc/nursingcouncil/
        │   ├── NursingCouncilApplication.java
        │   ├── config/
        │   │   └── SecurityConfig.java
        │   ├── controller/
        │   │   ├── RegistrationController.java
        │   │   ├── RenewalController.java
        │   │   ├── StatusController.java
        │   │   ├── VerifyController.java
        │   │   └── NoticeController.java
        │   ├── dto/
        │   │   ├── request/  (RegistrationRequest, RenewalRequest, ...)
        │   │   └── response/ (ApiResponse, ApplicationResponse, ...)
        │   ├── entity/
        │   │   ├── Applicant.java
        │   │   ├── Application.java
        │   │   ├── CourseDetail.java
        │   │   ├── RefresherCourseDetail.java
        │   │   ├── Document.java
        │   │   ├── Payment.java
        │   │   ├── ApplicationStatusHistory.java
        │   │   ├── RegisteredNurse.java
        │   │   └── Notice.java
        │   ├── enums/
        │   │   ├── ApplicationStatus.java
        │   │   ├── ApplicationType.java
        │   │   ├── CourseType.java
        │   │   ├── DocumentType.java
        │   │   ├── Gender.java
        │   │   ├── PaymentMethod.java
        │   │   └── PaymentStatus.java
        │   ├── exception/
        │   │   ├── GlobalExceptionHandler.java
        │   │   ├── ResourceNotFoundException.java
        │   │   └── ValidationException.java
        │   ├── repository/
        │   │   ├── ApplicantRepository.java
        │   │   ├── ApplicationRepository.java
        │   │   ├── DocumentRepository.java
        │   │   ├── NoticeRepository.java
        │   │   └── RegisteredNurseRepository.java
        │   ├── service/
        │   │   ├── NoticeService.java
        │   │   ├── RegistrationService.java
        │   │   ├── RenewalService.java
        │   │   ├── StatusService.java
        │   │   ├── VerificationService.java
        │   │   └── impl/
        │   │       ├── NoticeServiceImpl.java
        │   │       ├── RegistrationServiceImpl.java
        │   │       ├── RenewalServiceImpl.java
        │   │       ├── StatusServiceImpl.java
        │   │       └── VerificationServiceImpl.java
        │   └── util/
        │       ├── FileStorageService.java
        │       └── ReferenceNumberGenerator.java
        └── resources/
            ├── application.yml
            └── db/migration/
                └── V1__initial_schema.sql
```
