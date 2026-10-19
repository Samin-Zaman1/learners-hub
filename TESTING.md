# Testing

How Learners Hub is tested: the strategy, what is covered today, how to run it, and the defects testing has turned up.

Testing is being built layer by layer, from the bottom of the test pyramid up. Each layer below says whether it is in place or planned.

## Strategy

| Layer | Tooling | What it proves | Status |
|---|---|---|---|
| Unit | Jest, ts-jest, `jest.fn()` mocks | Business rules in services and utilities, with no database | ✅ In place |
| Integration (API) | Jest, Supertest, test database | Controllers, guards, validation and services work together over HTTP | Planned |
| Database | Prisma against Postgres | Constraints hold: unique emails, one enrollment per course, cascading deletes | Planned |
| End-to-end | Playwright | A real user can log in, enroll in a course and work on a task in the browser | Planned |

Unit tests run in milliseconds and pin down logic. The slower layers above them check what mocks can't, such as whether a Prisma query actually returns the related rows the code expects.

## Running the tests

From the repository root:

```bash
npm test           # API unit tests
npm run test:cov   # same, with a coverage report in apps/api/coverage/
```

To run a single file, pass part of its path to Jest from `apps/api`:

```bash
cd apps/api
npm run test -- student-task
```

Every push to `main` and every pull request runs the unit tests in GitHub Actions ([workflow](.github/workflows/tests.yml)); the coverage report is attached to each run as an artifact.

## What is covered

### `StudentTaskService`: viewing and updating a student's task submission

[`student-task.service.spec.ts`](apps/api/src/student/student-task.service.spec.ts) replaces Prisma with a hand-built fake, so each test controls exactly what the "database" returns. Every branch of both methods has a test.

| Method | Scenario | Expected |
|---|---|---|
| `getTaskSubmission` | Submission doesn't exist | `NotFoundException` |
| | Submission belongs to another student | `ForbiddenException` |
| | Submission belongs to the student | Returns the submission with its task |
| `updateSubmission` | Submission doesn't exist | `NotFoundException` |
| | Submission belongs to another student | `ForbiddenException` |
| | Progress above 100 | `BadRequestException` |
| | Progress below 0 | `BadRequestException` |
| | Status set to `COMPLETED` | Progress forced to 100 and `submittedAt` recorded |
| | Regular progress update | Returns "Submission updated" |

### Invitation codes: generating and validating course join codes

[`code-generator.spec.ts`](apps/api/src/utils/code-generator.spec.ts)

- **Validation:** one test per rule, each input breaking exactly one rule: too short, too long, a banned look-alike character (`0`, `O`, `1`, `I`), lowercase, special characters, a space, a missing hyphen.
- **Generation:** the output is random, so the tests check properties that must always hold (the `XXXX-XXXX` format, a length of 9, two calls giving different codes) rather than exact values.

## Techniques used

- **Arrange, Act, Assert** in every test.
- **One reason to fail per test.** Each invalid input breaks a single rule, so a failure points straight at the cause.
- **Mocked dependencies.** The service receives Prisma through its constructor, so tests pass in a fake with only the methods the code under test calls.
- **Test data factory.** `makeSubmission(overrides)` builds a default record, and each test overrides only the field that matters to it, such as `makeSubmission({ studentId: 'student2' })`.
- **Assert on output, not input.** The service reshapes database rows, so expectations describe what the API returns, not what the fake was given.
- **Planning with `it.todo`.** Every `if` and `throw` in a method is listed as a pending test before any test code is written.

## Defects found

| # | Found by | Issue | Status |
|---|---|---|---|
| 1 | Unit testing | `getTaskSubmission` doesn't return the submission's `progress`, so the student can't see their own progress | Open |
| 2 | Code review while planning integration tests | `JwtAuthGuard` rejects a missing or invalid token by returning `false`, which NestJS turns into **403 Forbidden**. The web client only sends users back to the login page on **401**, so a user whose token has expired stays on a page that keeps failing. | Open, to be confirmed by an integration test |

## Roadmap

1. **API integration tests:** log in through `/api/auth/login`, call protected routes with and without a token, and check the status codes (this will confirm defect 2).
2. **Database tests:** run against a disposable Postgres to check unique and cascade rules.
3. **Playwright end-to-end tests:** log in, enroll with an invitation code, update a task, and check the dashboard.
4. **Web unit tests:** cover the pure route-permission helpers in `apps/web/src/hooks/useAuth.ts`.
5. **Remaining unit gaps:** an empty-string invitation code, and the other student and instructor services.
