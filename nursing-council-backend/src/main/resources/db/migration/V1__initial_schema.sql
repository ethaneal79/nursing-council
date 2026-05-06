-- ============================================================
-- MSNC Database Schema  –  V1__initial_schema.sql
-- Meghalaya State Nursing Council
-- ============================================================

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE course_type AS ENUM (
    'GNM',
    'BSC_NURSING',
    'POST_BASIC_BSC',
    'MSC_NURSING',
    'ANM'
);

CREATE TYPE application_status AS ENUM (
    'SUBMITTED',
    'DOCUMENTS_VERIFIED',
    'COUNCIL_REVIEW',
    'CERTIFICATE_GENERATION',
    'COMPLETED',
    'REJECTED'
);

CREATE TYPE application_type AS ENUM (
    'NEW_REGISTRATION',
    'RENEWAL'
);

CREATE TYPE payment_method AS ENUM (
    'UPI',
    'NET_BANKING',
    'CARD',
    'DEMAND_DRAFT'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);

CREATE TYPE document_type AS ENUM (
    'PHOTOGRAPH',
    'IDENTITY_PROOF',
    'COURSE_CERTIFICATE',
    'MARKSHEET',
    'INTERNSHIP_CERTIFICATE',
    'CHARACTER_CERTIFICATE',
    'REFRESHER_CERTIFICATE',
    'ID_PROOF_RENEWAL'
);

CREATE TYPE gender AS ENUM ('FEMALE', 'MALE', 'OTHER');

-- ─── APPLICANTS ─────────────────────────────────────────────
CREATE TABLE applicants (
    id                  BIGSERIAL PRIMARY KEY,
    full_name           VARCHAR(200)  NOT NULL,
    date_of_birth       DATE          NOT NULL,
    gender              gender        NOT NULL,
    nationality         VARCHAR(100)  NOT NULL DEFAULT 'Indian',
    email               VARCHAR(255)  NOT NULL,
    mobile              VARCHAR(15)   NOT NULL,
    permanent_address   TEXT          NOT NULL,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applicants_email  ON applicants(email);
CREATE INDEX idx_applicants_mobile ON applicants(mobile);

-- ─── APPLICATIONS ───────────────────────────────────────────
CREATE TABLE applications (
    id                      BIGSERIAL PRIMARY KEY,
    reference_number        VARCHAR(30)        UNIQUE NOT NULL,
    applicant_id            BIGINT             NOT NULL REFERENCES applicants(id),
    application_type        application_type   NOT NULL,
    status                  application_status NOT NULL DEFAULT 'SUBMITTED',
    submitted_at            TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    last_updated_at         TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    rejection_reason        TEXT,
    admin_notes             TEXT
);

CREATE INDEX idx_applications_ref        ON applications(reference_number);
CREATE INDEX idx_applications_applicant  ON applications(applicant_id);
CREATE INDEX idx_applications_status     ON applications(status);

-- ─── APPLICATION STATUS HISTORY ─────────────────────────────
CREATE TABLE application_status_history (
    id              BIGSERIAL PRIMARY KEY,
    application_id  BIGINT             NOT NULL REFERENCES applications(id),
    status          application_status NOT NULL,
    changed_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    changed_by      VARCHAR(100),
    notes           TEXT
);

CREATE INDEX idx_status_history_app ON application_status_history(application_id);

-- ─── COURSE DETAILS ─────────────────────────────────────────
CREATE TABLE course_details (
    id                      BIGSERIAL PRIMARY KEY,
    application_id          BIGINT      NOT NULL UNIQUE REFERENCES applications(id),
    course_name             course_type NOT NULL,
    year_of_passing         SMALLINT    NOT NULL,
    institution_name        VARCHAR(300) NOT NULL,
    university_or_board     VARCHAR(300) NOT NULL,
    exam_roll_number        VARCHAR(100),
    previous_council_reg_no VARCHAR(100)
);

-- ─── REFRESHER COURSE DETAILS (for renewals) ────────────────
CREATE TABLE refresher_course_details (
    id                  BIGSERIAL PRIMARY KEY,
    application_id      BIGINT       NOT NULL REFERENCES applications(id),
    course_title        VARCHAR(300),
    year_attended       SMALLINT,
    organising_body     VARCHAR(300),
    duration            VARCHAR(100)
);

-- ─── PAYMENTS ───────────────────────────────────────────────
CREATE TABLE payments (
    id                  BIGSERIAL PRIMARY KEY,
    application_id      BIGINT          NOT NULL UNIQUE REFERENCES applications(id),
    amount              NUMERIC(10, 2)  NOT NULL,
    payment_method      payment_method  NOT NULL,
    transaction_ref     VARCHAR(200),
    status              payment_status  NOT NULL DEFAULT 'PENDING',
    paid_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_app ON payments(application_id);
CREATE INDEX idx_payments_ref ON payments(transaction_ref);

-- ─── DOCUMENTS ──────────────────────────────────────────────
CREATE TABLE documents (
    id              BIGSERIAL PRIMARY KEY,
    application_id  BIGINT        NOT NULL REFERENCES applications(id),
    document_type   document_type NOT NULL,
    file_name       VARCHAR(255)  NOT NULL,
    file_path       VARCHAR(500)  NOT NULL,
    mime_type       VARCHAR(100)  NOT NULL,
    file_size_bytes BIGINT,
    uploaded_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_app ON documents(application_id);

-- ─── REGISTERED NURSES (issued certificates) ────────────────
CREATE TABLE registered_nurses (
    id                  BIGSERIAL PRIMARY KEY,
    registration_number VARCHAR(50)  UNIQUE NOT NULL,
    applicant_id        BIGINT       NOT NULL REFERENCES applicants(id),
    application_id      BIGINT       NOT NULL REFERENCES applications(id),
    course_name         course_type  NOT NULL,
    institution_name    VARCHAR(300) NOT NULL,
    registered_on       DATE         NOT NULL,
    valid_until         DATE         NOT NULL,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    certificate_url     VARCHAR(500)
);

CREATE INDEX idx_nurses_reg_no   ON registered_nurses(registration_number);
CREATE INDEX idx_nurses_active   ON registered_nurses(is_active);

-- ─── NEWS / NOTICES ─────────────────────────────────────────
CREATE TABLE notices (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(500) NOT NULL,
    body        TEXT         NOT NULL,
    is_ticker   BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SEED DATA ───────────────────────────────────────────────
INSERT INTO notices (title, body, is_ticker) VALUES
  ('Renewal drive 2026',
   'All nurses whose registration expires in 2026 must renew by 31 March 2026. Late renewals attract a penalty fee.',
   TRUE),
  ('New registration portal open',
   'The online registration portal for fresh nursing graduates (batch 2025) is now open. Apply before 30 June 2026.',
   FALSE),
  ('CME workshop – wound care',
   'A two-day continuing medical education workshop on advanced wound care will be held in Shillong on 10–11 May 2026.',
   FALSE);
