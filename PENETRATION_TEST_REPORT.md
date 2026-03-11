# Penetration Test Report
Tester: xkyrage

## Project

Cepek Online Card Game

Production URL:
https://cepek-production.up.railway.app/

---

# Assessment Summary

A security assessment was conducted to identify vulnerabilities affecting the Cepek game.

Testing focused on:

- Input validation
- API security
- Game logic manipulation
- Session management

---

# Methodology

Testing followed common web security testing approaches:

- Manual security testing
- Input validation testing
- API endpoint testing
- Game configuration testing

Testing categories included:

- Injection attacks
- Game logic abuse
- Session handling
- Input validation flaws

---

# Findings

## Finding 1: Bot Limit Validation Missing

Severity: Medium

Description:

The application allows users to attempt to configure more than the allowed number of bots.

When the bot value exceeds the allowed limit, the system throws an error instead of properly preventing the action.

Impact:

- Game configuration failure
- Potential abuse of game logic
- Poor user experience

Recommendation:

Implement both frontend and backend validation to enforce the maximum allowed bot limit.

---

# Risk Rating

| Severity | Count |
|--------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 0 |

---

# Recommendations

1. Implement strict input validation.
2. Enforce server-side validation for game configuration.
3. Improve error handling for invalid user input.
4. Introduce rate limiting for API endpoints.
5. Perform regular dependency vulnerability scans.

---

# Conclusion

The application generally functions as expected but requires improvements in input validation and error handling to prevent potential misuse of game configuration features.

Regular security testing and code review are recommended to maintain application security.
