# Cheat Prevention Strategy

## Overview

This document describes security mechanisms implemented to prevent cheating in the Cepek online multiplayer card game.

Production environment:
https://cepek-production.up.railway.app/

Multiplayer card games are vulnerable to manipulation if client input is trusted. Therefore, all critical gameplay logic must be enforced on the server.

---

# Core Principles

The anti-cheat strategy follows three principles:

1. **Never trust the client**
2. **Validate all actions server-side**
3. **Ensure deterministic game state**

---

# Potential Cheating Methods

## 1. Client-Side Manipulation

Attackers may modify JavaScript or intercept API calls to alter gameplay behavior.

Examples:

- Changing game parameters
- Modifying API payloads
- Injecting unauthorized actions

Mitigation:

- All game actions must be validated on the server
- Client should only act as a rendering interface
- Reject invalid state transitions

---

## 2. Game State Manipulation

Players could attempt to alter game states such as:

- Card distribution
- Player score
- Turn order

Mitigation:

- Game state must only be stored and updated on the server
- Clients cannot submit authoritative state updates
- Validate every action against current server state

---

## 3. Bot Manipulation

Game configuration parameters may be abused.

Example:

- Setting bot count higher than allowed

Mitigation:

- Enforce strict server-side validation
- Reject values outside allowed ranges
- Implement safe default values

---

## 4. Replay Attacks

Attackers may capture and resend previous requests.

Mitigation:

- Use unique request identifiers
- Validate session tokens
- Verify game state progression

---

## 5. Packet Tampering

Attackers could intercept and modify network requests.

Mitigation:

- Use HTTPS for encrypted communication
- Validate request payloads
- Reject malformed requests

---

# Server-Side Validation Rules

The server must verify:

- Player identity
- Game session membership
- Turn order
- Valid card actions
- Valid game configuration

Example validations:

 - Bot count must be between 0 and 10
 - Players may only act during their turn
 - Game state transitions must follow valid rules

---

# Rate Limiting

To prevent automated cheating:

- Limit room creation requests
- Limit API requests per session
- Detect abnormal request patterns

---

# Logging and Monitoring

Suspicious behavior should be logged:

Examples:

- Excessive room creation
- Repeated invalid requests
- Unusual API patterns

Logs should include:

- IP address
- User session
- Request type
- Timestamp

---

# Future Improvements

Possible enhancements include:

- Anti-bot detection
- Behavioral anomaly detection
- Server-side game replay validation
- Integrity verification of game states
