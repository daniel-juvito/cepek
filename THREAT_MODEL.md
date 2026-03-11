# Threat Model

## Overview

This document outlines potential security threats and attack surfaces for the Cepek online card game.

Production environment:
https://cepek-production.up.railway.app/

The goal is to identify risks that could compromise:

- Game fairness
- System integrity
- User data
- Application availability

---

# Architecture Overview

Typical system components include:

Client (Browser)
↓
Frontend Application
↓
Backend API
↓
Database
↓
Game Logic Engine

Trust boundaries exist between:

- Client ↔ Server
- API ↔ Database
- Game logic ↔ Client input

---

# Assets to Protect

Critical assets include:

- Game state
- Player sessions
- Game results
- Server resources
- Application availability

Optional assets:

- User accounts
- Player statistics

---

# Threat Categories

## 1. Game Logic Manipulation

Attackers may attempt to manipulate game behavior.

Examples:

- Changing bot count
- Manipulating card distribution
- Altering scores
- Sending forged API requests

Mitigation:

- Validate all actions server-side
- Never trust client input
- Verify game state transitions

---

## 2. Input Validation Attacks

Improper input validation could lead to:

- SQL Injection
- Command Injection
- Game configuration abuse

Example:

Setting bot count higher than allowed.

Mitigation:

- Implement strict input validation
- Use parameterized queries
- Apply server-side validation

---

## 3. Authentication & Session Attacks

Potential risks include:

- Session hijacking
- Session fixation
- Unauthorized game access

Mitigation:

- Secure cookies
- Session expiration
- Token validation

---

## 4. Client-Side Trust

The client application should not be trusted.

Attackers could modify:

- JavaScript code
- API requests
- Game actions

Mitigation:

- Validate every action on the server
- Do not rely on client-side enforcement

---

## 5. Rate Abuse / Bot Attacks

Attackers may attempt to:

- Create excessive game rooms
- Spam API endpoints
- Exhaust server resources

Mitigation:

- Implement rate limiting
- Monitor traffic patterns
- Apply request throttling

---

## 6. Denial of Service (DoS)

Large volumes of requests could disrupt service availability.

Mitigation:

- Rate limiting
- Request size limits
- Reverse proxy protection

---

# Threat Severity Levels

| Level | Description |
|------|-------------|
| Critical | Game integrity compromised |
| High | Unauthorized system access |
| Medium | Partial manipulation or abuse |
| Low | Minor security misconfiguration |

---

# Security Goals

The system should ensure:

- Fair gameplay
- Secure session handling
- Protection against input manipulation
- Availability of the game service
