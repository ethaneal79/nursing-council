/**
 * src/services/api.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central API client for the Meghalaya State Nursing Council frontend.
 * All communication with the Spring Boot backend goes through this module.
 *
 * Base URL is read from the environment variable REACT_APP_API_BASE_URL.
 * For local development add this to your .env file:
 *   REACT_APP_API_BASE_URL=http://localhost:8080/api
 */

import axios from 'axios';

// ── Axios instance ─────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ── Response interceptor: unwrap the ApiResponse<T> envelope ──────────────
client.interceptors.response.use(
  (response) => response.data,          // { success, message, data }
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submit a new nurse registration (steps 1, 2 & 4 combined).
 *
 * @param {Object} payload - matches RegistrationRequest DTO
 * @returns {Promise<{success, message, data: ApplicationResponse}>}
 */
export const submitRegistration = (payload) =>
  client.post('/registration', payload);

/**
 * Upload a single document for an existing registration application.
 *
 * @param {string}   referenceNumber  e.g. "MSNC-2026-04821"
 * @param {string}   documentType     e.g. "PHOTOGRAPH" | "IDENTITY_PROOF" | …
 * @param {File}     file             the File object from an <input type="file">
 */
export const uploadRegistrationDocument = (referenceNumber, documentType, file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post(
    `/registration/${referenceNumber}/documents?documentType=${documentType}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RENEWAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Step 1 — verify nurse identity before starting a renewal.
 *
 * @param {string} registrationNumber
 * @param {string} mobile
 * @param {string} fullName
 * @returns {Promise<{success, data: VerificationResponse}>}
 */
export const verifyNurseForRenewal = (registrationNumber, mobile, fullName) =>
  client.get('/renewal/verify', {
    params: { registrationNumber, mobile, fullName },
  });

/**
 * Steps 2-3 — submit refresher details + payment.
 *
 * @param {Object} payload - matches RenewalRequest DTO
 */
export const submitRenewal = (payload) =>
  client.post('/renewal', payload);

/**
 * Upload a document for a renewal application.
 */
export const uploadRenewalDocument = (referenceNumber, documentType, file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post(
    `/renewal/${referenceNumber}/documents?documentType=${documentType}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATE VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify a certificate by registration number and optional nurse name.
 *
 * @param {string} registrationNumber
 * @param {string} [fullName]
 * @returns {Promise<{success, data: VerificationResponse}>}
 */
export const verifyCertificate = (registrationNumber, fullName) =>
  client.post('/verify', { registrationNumber, fullName: fullName || undefined });

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION STATUS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track an application by reference number and registered mobile.
 *
 * @param {string} referenceNumber
 * @param {string} mobile
 * @returns {Promise<{success, data: ApplicationResponse}>}
 */
export const trackApplicationStatus = (referenceNumber, mobile) =>
  client.post('/status/track', { referenceNumber, mobile });

// ─────────────────────────────────────────────────────────────────────────────
// NOTICES
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all active notices for the News section. */
export const fetchNotices = () =>
  client.get('/notices');

/** Fetch ticker-only notices for the scrolling banner. */
export const fetchTickerNotices = () =>
  client.get('/notices/ticker');

export default client;

// ─────────────────────────────────────────────────────────────────────────────
// STAFF AUTH
// ─────────────────────────────────────────────────────────────────────────────

export const staffLogin = (username, password) =>
  client.post('/auth/login', { username, password });

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  (SUPERUSER only)
// ─────────────────────────────────────────────────────────────────────────────
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const adminGetDashboard = (token) =>
  client.get('/admin/dashboard', authHeader(token));

export const adminGetUsers = (token) =>
  client.get('/admin/users', authHeader(token));

export const adminCreateUser = (token, payload) =>
  client.post('/admin/users', payload, authHeader(token));

export const adminChangeRole = (token, userId, role) =>
  client.patch(`/admin/users/${userId}/role?role=${role}`, {}, authHeader(token));

export const adminDeactivateUser = (token, userId) =>
  client.patch(`/admin/users/${userId}/deactivate`, {}, authHeader(token));

export const adminActivateUser = (token, userId) =>
  client.patch(`/admin/users/${userId}/activate`, {}, authHeader(token));

// ─────────────────────────────────────────────────────────────────────────────
// DEALING ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────

export const daGetAllApplications = (token) =>
  client.get('/da/applications', authHeader(token));

export const daGetUnprocessed = (token) =>
  client.get('/da/applications/unprocessed', authHeader(token));

export const daUpdateStatus = (token, referenceNumber, payload) =>
  client.patch(`/da/applications/${referenceNumber}/status`, payload, authHeader(token));

export const daGetReport = (token) =>
  client.get('/da/reports/summary', authHeader(token));

export const daGetFine = (token, referenceNumber) =>
  client.get(`/da/applications/${referenceNumber}/fine`, authHeader(token));

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRAR
// ─────────────────────────────────────────────────────────────────────────────

export const registrarGetApplications = (token) =>
  client.get('/registrar/applications', authHeader(token));

export const registrarApprove = (token, referenceNumber, payload) =>
  client.patch(`/registrar/applications/${referenceNumber}/approve`, payload, authHeader(token));

export const registrarReject = (token, referenceNumber, payload) =>
  client.patch(`/registrar/applications/${referenceNumber}/reject`, payload, authHeader(token));

export const registrarComplete = (token, referenceNumber) =>
  client.patch(`/registrar/applications/${referenceNumber}/complete`, {}, authHeader(token));
