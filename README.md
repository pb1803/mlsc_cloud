# Conference Access System

A full-stack web app for conferences where each team enters a unique numeric access code to retrieve only their own assigned credentials.

## Features

- Modern, responsive frontend (Tailwind + vanilla JavaScript)
- Secure API endpoint: `POST /api/get-credentials`
- Returns credentials only for the submitted code
- Numeric code validation and robust error responses
- Loading state and disabled button during requests
- Reusable codes by default (`SINGLE_USE_CODES=false`)
- Admin bulk insert route with token authentication
- Admin single-code update route for quick changes
- Local JSON storage (simple and fast for event use)

## Project Structure

```text
mlsc_cloud/
  backend/
    data/
      credentials.json
    scripts/
      seedData.js
    src/
      routes/credentials.js
      services/credentialStore.js
      validators/credentialValidator.js
      config.js
      server.js
    .env.example
    package.json
  frontend/
    index.html
    app.js
    styles.css
  README.md
```

## Setup

1. Open a terminal in `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create env file:
   ```bash
   copy .env.example .env
   ```
   If `copy` is unavailable, create `.env` manually from `.env.example`.
4. Start server:
   ```bash
   npm start
   ```
5. Open in browser:
   - `http://localhost:4000`

## API Reference

### POST `/api/get-credentials`

Request body:

```json
{
  "code": "1001"
}
```

Success response:

```json
{
  "success": true,
  "username": "team1_user",
  "password": "pass123"
}
```

Invalid response:

```json
{
  "success": false,
  "message": "Invalid code. Please check and try again."
}
```

### POST `/api/admin/bulk-insert`

Headers:

- `x-admin-token: <ADMIN_TOKEN>`

Request body:

```json
{
  "entries": [
    { "code": "2001", "username": "teamA", "password": "pwA" },
    { "code": "2002", "username": "teamB", "password": "pwB" }
  ]
}
```

### POST `/api/admin/update-credential`

Use this when you want to update exactly one code as admin.

Headers:

- `x-admin-token: <ADMIN_TOKEN>`

Request body:

```json
{
  "code": "1001",
  "username": "team1_updated",
  "password": "newPass2026"
}
```

Response:

```json
{
  "success": true,
  "message": "Credential updated for code 1001.",
  "total": 3,
  "inserted": 1
}
```

Response:

```json
{
  "success": true,
  "message": "Entries inserted successfully.",
  "total": 5,
  "inserted": 2
}
```

## Seeding Sample Data

From `backend`:

```bash
npm run seed
```

## Notes

- This implementation uses local JSON storage for simplicity.
- If you want MongoDB later, you can swap the storage layer in `backend/src/services/credentialStore.js`.
- Users can access credentials many times when `SINGLE_USE_CODES=false` (default).
