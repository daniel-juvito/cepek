# Security Audit Report

## Project

Cepek Online Card Game

Repository:
https://github.com/daniel-juvito/cepek

Production Environment:
https://cepek-production.up.railway.app/

---

# Security Auditor

This security audit was conducted by:

**Security Auditor:** xkyrage  
**Role:** Penetration Tester & Security Researcher  

he audit involved manual testing, application analysis, and security review of the Cepek online card game deployment and repository.

Testing included:

- Application security review
- Input validation testing
- Game logic manipulation testing
- API behavior analysis
- Configuration security review

The objective of the audit was to identify vulnerabilities and provide recommendations to improve the overall security posture of the application.

# Audit Overview

A security audit was conducted to evaluate the security posture of the Cepek online card game.

The purpose of this audit is to identify vulnerabilities that may affect:

- Game fairness
- Application integrity
- Server stability
- User security

The audit focused on reviewing the application architecture, game logic, and potential attack surfaces.

---

# Scope

The following areas were included in the security review:

Frontend Application  
Backend API  
Game Logic  
Input Validation  
Session Handling  
Game Configuration Parameters  

---

# Methodology

The audit used a combination of:

Manual code review  
Manual application testing  
Input validation testing  
Game logic manipulation testing  

Testing approach was based on:

OWASP Web Security Testing Guide (WSTG)  
OWASP Top 10 (2021)

---

# System Architecture

Typical architecture for the application:

Client (Browser)
↓
Frontend Application
↓
Backend API
↓
Game Engine
↓
Database

Trust boundaries exist between:

Client ↔ Server  
API ↔ Database  
Game Engine ↔ Player Input

---

# Attack Surface Analysis

Primary attack surfaces include:

## 1. Client Input

User inputs such as:

- Game room configuration
- Bot count
- Player actions
- Game commands

Risk:

Client input could be manipulated through modified requests.

Mitigation:

All inputs must be validated server-side.

---

## 2. API Endpoints

Game functionality likely depends on API endpoints for:

- Creating game rooms
- Joining games
- Performing game actions
- Managing sessions

Risk:

Attackers may manipulate requests or send unexpected payloads.

Mitigation:

Implement strict request validation and authentication.

---

## 3. Game Logic

Multiplayer games are particularly sensitive to logic manipulation.

Examples of possible abuse:

- Changing game parameters
- Altering game state
- Manipulating turn order

Mitigation:

Game state must be controlled exclusively by the server.

---

# Findings

## Finding 1: Missing Validation for Bot Limit

Severity: Medium

Description:

The application allows users to attempt to set the number of bots higher than the supported limit.

Instead of preventing the action through validation, the system produces an error.

Impact:

Game setup fails and the user receives an unclear error.

Potential Risk:

Improper input validation could lead to future logic manipulation vulnerabilities.

Recommendation:

Implement strict validation rules such as:

- Maximum bot count enforcement
- Clear validation messages
- Backend validation checks

Example rule:

Bot count must not exceed 10.

---

# Risk Rating Summary

| Severity | Count |
|--------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 0 |
| Informational | 0 |

---

# Security Strengths

Positive observations during the audit:

- Application uses HTTPS for secure communication
- Simple architecture reduces attack complexity
- Limited attack surface due to minimal features

---

# Security Recommendations

## Input Validation

All user input must be validated server-side.

Recommended validations:

- Bot limits
- Game parameters
- Player actions

---

## Server-Side Game Logic

Game state must be controlled exclusively by the backend.

The client should never determine:

- Game results
- Card distribution
- Turn order
- Scores

---

## Error Handling

Improve error responses by:

- Providing clear validation messages
- Avoiding stack trace exposure
- Logging errors internally

---

## Rate Limiting

Protect endpoints from abuse by implementing:

- API request limits
- Room creation limits
- Session request throttling

---

## Dependency Monitoring

Regularly check dependencies for vulnerabilities using:

npm audit

or GitHub Dependabot.

---

# Future Security Improvements

To further strengthen the security posture:

- Implement automated security testing
- Add API request validation middleware
- Introduce centralized logging and monitoring
- Perform periodic security reviews

---

# Conclusion

The Cepek card game currently presents a relatively small attack surface but requires improvements in input validation and game configuration handling.

Implementing the recommended fixes will significantly improve the overall security and reliability of the application.

---

# Auditor Notes

This audit represents an initial security review and does not replace a full penetration test.

Continuous security testing and monitoring are recommended for production systems.
