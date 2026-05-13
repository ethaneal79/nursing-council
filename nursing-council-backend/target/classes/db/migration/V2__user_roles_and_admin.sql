-- ============================================================
-- V2__user_roles_and_admin.sql
-- Adds role-based user management for internal staff
-- ============================================================

-- ─── USER ROLE ENUM ─────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
    'SUPERUSER',
    'REGISTRAR',
    'DEALING_ASSISTANT'
);

-- ─── COUNCIL USERS TABLE ─────────────────────────────────────
CREATE TABLE council_users (
    id            BIGSERIAL    PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    full_name     VARCHAR(200) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role    NOT NULL,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_council_users_username ON council_users(username);
CREATE INDEX idx_council_users_role     ON council_users(role);

-- ─── SEED: Default superuser ─────────────────────────────────
-- Password: Admin@1234  (BCrypt hash — change on first login!)
INSERT INTO council_users (username, full_name, email, password_hash, role) VALUES
(
    'admin',
    'System Administrator',
    'admin@msnc.gov.in',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh9i',
    'SUPERUSER'
);

-- ─── Add processed_by column to applications ──────────────────
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS processed_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- ─── Add fine tracking columns ────────────────────────────────
-- Fine of ₹5050 applies to late renewals (submitted after 31 March)
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS fine_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS fine_reason  TEXT;
