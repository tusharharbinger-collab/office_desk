# SmartDesk — Organization Access & Security Guide

This document outlines how to restrict SmartDesk account creation and login access exclusively to verified members of your organization.

---

## Table of Contents
1. [Overview](#1-overview)
2. [Method 1: Corporate Email Domain Whitelisting](#2-method-1-corporate-email-domain-whitelisting)
3. [Method 2: Microsoft 365 / Entra ID Single-Tenant Restriction](#3-method-2-microsoft-365--entra-id-single-tenant-restriction)
4. [Method 3: Enterprise SSO-Only Mode (Recommended)](#4-method-3-enterprise-sso-only-mode-recommended)
5. [Step-by-Step Implementation Guide](#5-step-by-step-implementation-guide)
6. [Security Checklist](#6-security-checklist)

---

## 1. Overview

By default in development environments, open registration allows any valid email address format to sign up. In a production enterprise deployment, access must be locked down to prevent unauthorized individuals from viewing office blueprints, employee presence, or booking desks.

---

## 2. Method 1: Corporate Email Domain Whitelisting

Restrict email/password registration so that **only emails matching your organization's official domain(s)** are accepted. Any external domain (such as `@gmail.com`, `@yahoo.com`, or `@outlook.com`) is rejected immediately.

### Key Advantages:
- Prevents personal or competitor email addresses from creating accounts.
- Works immediately without requiring Azure administrator privileges.
- Supports multiple authorized domains (e.g., `@yourcompany.com` and `@subsidiary.com`).

---

## 3. Method 2: Microsoft 365 / Entra ID Single-Tenant Restriction

If your organization uses Microsoft 365 / Microsoft Entra ID (formerly Azure Active Directory), authentication can be tied directly to your corporate directory.

### Configuration in `.env`:
```env
# Lock to your organization's specific Microsoft Entra ID Directory (Tenant) ID
AZURE_TENANT_ID=feab5e46-2c71-473a-b616-a12a9aeefede
AZURE_CLIENT_ID=77f3d832-4e04-4d73-b35a-6dfac14c89fc
AZURE_CLIENT_SECRET=YOUR_AZURE_CLIENT_SECRET
AZURE_REDIRECT_URI=http://localhost:5173
```

### How Microsoft Enforces This:
1. When `AZURE_TENANT_ID` is set to your organization's GUID (rather than `common` or `organizations`), Microsoft will **only authenticate users who exist in your tenant directory**.
2. Any attempt to log in using a personal Microsoft account (`@outlook.com`, `@live.com`) or an account from another company will be blocked by Microsoft before reaching your application.

---

## 4. Method 3: Enterprise SSO-Only Mode (Recommended)

In modern enterprise setups, standard email/password registration is completely disabled. All access is handled through Microsoft 365 Single Sign-On (SSO).

### Why Enterprise Teams Prefer This:
- **Zero Password Management**: Employees never need to remember or reset SmartDesk passwords.
- **Instant Onboarding**: When a new employee signs in with Microsoft 365 on their first day, their account is auto-provisioned in SmartDesk.
- **Instant Offboarding**: When an employee leaves the company and IT disables their corporate Microsoft 365 account, their SmartDesk access is **automatically terminated**.
- **MFA Enforcement**: Enforces your corporate Multi-Factor Authentication (MFA / Authenticator app) policies automatically.

---

## 5. Step-by-Step Implementation Guide

### A. Add Domain Whitelist in Environment Variables
Add your allowed domains to your `.env` file:
```env
# Comma-separated list of approved organization email domains
ALLOWED_EMAIL_DOMAINS=@company.com,@harbingergroup.com
```

### B. Enforce in Backend Registration (`server/index.ts`)
Add domain validation before creating the user in SQLite:
```typescript
const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || '')
  .split(',')
  .map(d => d.trim().toLowerCase())
  .filter(Boolean);

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, department } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();

  // 1. Check corporate domain
  if (allowedDomains.length > 0) {
    const isAllowed = allowedDomains.some(domain => cleanEmail.endsWith(domain));
    if (!isAllowed) {
      return res.status(403).json({
        error: `Registration is restricted to authorized company email addresses (${allowedDomains.join(', ')}).`
      });
    }
  }

  // 2. Enforce standard employee role
  const role = 'user';

  // Proceed with user creation...
});
```

### C. (Optional) Disable Public Password Registration
To enforce Microsoft SSO-only:
1. In `server/index.ts`, return a `403 Forbidden` on `/api/auth/register` directing users to Microsoft SSO.
2. In the frontend (`LandingPage.tsx` and `Header.tsx`), route the primary call-to-action directly to `onOpenMicrosoftSSO()`.

---

## 6. Security Checklist

- [ ] `AZURE_TENANT_ID` is set to your organization's specific Tenant GUID (not `common`).
- [ ] Self-registration role is hardcoded to `'user'` (cannot self-promote to admin/manager).
- [ ] Email domain validation is enforced on the server, not just in the client UI.
- [ ] Database credentials and `JWT_SECRET` are customized and not using default placeholders.
- [ ] Sensitive secrets are stored in `.env` and kept out of version control (`.gitignore`).
