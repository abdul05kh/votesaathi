# VoteSaathi Test Suite Documentation

This project follows a strict **Test-Driven Development (TDD)** and **Production Hardening** methodology to ensure Rank-1 reliability.

## Test Infrastructure
- **Framework**: Jest + React Testing Library
- **Environment**: JSDoc
- **Coverage Tool**: Jest Built-in Coverage

## Test Location
All tests are located in the `src/tests/` directory, following the project structure:
- `src/tests/components/`: Component-level UI and interaction tests.
- `src/tests/lib/`: Logic and SDK integration tests (mocked).
- `src/tests/api/`: Edge-case and error handling verification.

## Running Tests
To verify the integrity of the platform, run:
```bash
npm test
```

To see detailed coverage reports:
```bash
npm run test:coverage
```

## Coverage Goals
- **Core AI Library**: >95%
- **Critical Components**: >90%
- **Overall Project**: >80%
