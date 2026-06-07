# Backend Logging Guide

The backend writes structured request and error logs to stdout/stderr. These logs are designed to work locally and in production log drains.

## Request IDs

Every HTTP response includes:

```text
x-request-id
```

The same value appears in backend logs as:

```text
requestId
```

Use this ID to trace one browser/API action across success and error logs.

## Log Format

By default logs are JSON:

```json
{
  "timestamp": "2026-06-07T15:00:00.000Z",
  "service": "crumbstall-api",
  "requestId": "...",
  "level": "info",
  "message": "HTTP request completed",
  "method": "GET",
  "path": "/api/v1/foods",
  "statusCode": 200,
  "durationMs": 12.34
}
```

For easier local reading, set:

```text
LOG_FORMAT="pretty"
```

## Environment Variables

```text
LOG_FORMAT="json"
LOG_LEVEL="info"
LOG_STACKS="true"
```

Options:

- `LOG_FORMAT=json`: machine-readable logs.
- `LOG_FORMAT=pretty`: compact local logs.
- `LOG_LEVEL=debug`: enables debug/verbose logs.
- `LOG_STACKS=false`: hides stack traces even outside production.

In production, stack traces are hidden by default.

## What Gets Logged

- Request method, path, status code, and duration.
- Request ID for every request.
- Customer/admin email from internal auth headers when available.
- Centralized exception logs with status code and error message.
- Stack traces for 500-level errors in local development.

Request bodies, secrets, payment signatures, R2 secrets, and raw payloads are not logged.
