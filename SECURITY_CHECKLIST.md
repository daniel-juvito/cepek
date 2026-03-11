# Security Checklist

This checklist helps ensure secure development practices for the Cepek card game.

---

# Application Security

## Input Validation

- [x] Validate all user inputs
- [x] Validate game configuration values
- [x] Enforce bot count limits
- [ ] Reject malformed requests

---

## Authentication

- [ ] Use secure session tokens
- [ ] Prevent session fixation
- [ ] Implement session expiration
- [ ] Protect session cookies

---

## Authorization

- [ ] Ensure players can only access their own game rooms
- [ ] Prevent unauthorized game actions
- [ ] Validate player identity on each request

---

# Game Logic Security

- [x] Validate game actions server-side
- [x] Prevent client manipulation
- [ ] Validate card distribution logic
- [ ] Ensure fair gameplay rules

---

# API Security

- [x] Validate request payloads
- [x] Implement rate limiting
- [ ] Protect sensitive endpoints
- [x] Handle errors securely

---

# Dependency Security

- [ ] Run dependency audits regularly
- [ ] Update outdated packages
- [ ] Monitor vulnerability alerts

Recommended tools:

- npm audit
- GitHub Dependabot

---

# Secret Management

Never commit:

- [ ] API keys
- [ ] database credentials
- [ ] private keys
- [ ] environment files

Use environment variables instead.

---

# Logging & Monitoring

- [ ] Log suspicious activities
- [ ] Monitor authentication failures
- [ ] Monitor abnormal traffic patterns

---

# Deployment Security

- [ ] Use HTTPS
- [ ] Protect production environment
- [ ] Restrict admin access
- [ ] Monitor application uptime
