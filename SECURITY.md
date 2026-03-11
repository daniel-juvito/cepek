# Security Policy

## Overview

The **Cepek Card Game** project takes security seriously.  
We appreciate responsible security research and encourage users and developers to report vulnerabilities that could affect the integrity, availability, or confidentiality of the application.

This document outlines how to report security vulnerabilities and how they will be handled by the project maintainers.

---

## Supported Versions

Currently, security updates are only provided for the latest version of the repository.

| Version | Supported |
|-------|-----------|
| Latest (main branch) | ✅ |
| Older commits | ❌ |

Users are encouraged to always use the latest version to ensure they receive security fixes.

---

## Reporting a Vulnerability

⚠ **Do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please report them privately.

### Preferred Reporting Method

1. Open a **GitHub Security Advisory**:
   - Go to the **Security** tab of the repository.
   - Click **Report a vulnerability**.
  
---

## What to Include in the Report

Please include as much of the following information as possible:

- Type of vulnerability (e.g., XSS, SQL Injection, authentication bypass)
- Affected file(s) or component(s)
- Steps to reproduce the issue
- Proof-of-concept (PoC) code or screenshots
- Potential impact of the vulnerability
- Suggested mitigation (if available)

Providing detailed information helps us respond faster.

---

## Vulnerability Disclosure Process

Once a vulnerability report is received:

1. The maintainers will **acknowledge the report within 48 hours**.
2. The issue will be **reviewed and validated**.
3. A fix will be developed and tested.
4. The fix will be released in the repository.
5. The reporter may be credited for responsible disclosure.

We aim to resolve confirmed vulnerabilities within **30–90 days**, depending on severity.

---

## Responsible Disclosure Guidelines

Security researchers are asked to:

- Act in **good faith** when testing the system.
- Avoid actions that could **disrupt service availability**.
- Avoid accessing **other users' data** without permission.
- Avoid exploiting vulnerabilities beyond what is necessary to demonstrate the issue.
- Allow maintainers reasonable time to fix the issue before public disclosure.

---

## Security Best Practices for Contributors

When contributing to this project, please follow these guidelines:

### 1. Avoid committing sensitive data
Never commit:

- API keys
- passwords
- access tokens
- private keys
- `.env` files

Use environment variables instead.

### 2. Validate all user inputs
Ensure that user inputs are validated and sanitized to prevent:

- SQL Injection
- Cross-Site Scripting (XSS)
- Command Injection

### 3. Dependency Management
Keep dependencies updated and regularly check for known vulnerabilities.

Recommended tools:

- `npm audit`
- `yarn audit`
- GitHub Dependabot

### 4. Authentication & Authorization
If authentication features are implemented:

- Use secure password hashing (e.g., bcrypt)
- Enforce proper session management
- Avoid storing sensitive data in plain text

---

## Security Considerations for the Cepek Game

Because this project is an **online card game**, the following security areas are especially important:

- Prevent **game state manipulation** by validating actions server-side.
- Avoid **client-side trust** for scoring or bot logic.
- Implement **rate limiting** to prevent abuse or bot spamming.
- Validate game configuration values (e.g., bot count limits).

---

## Acknowledgements

We thank all security researchers and contributors who help improve the security of this project through responsible disclosure.

---

## Maintainers

Project Maintainer:

- Daniel Juvito : https://github.com/daniel-juvito
- xkyrage : https://github.com/xkyrage
- Repository: https://github.com/daniel-juvito/cepek

For urgent security concerns, please contact the maintainer through the vulnerability reporting channel above.
