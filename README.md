# Financial Management System — REST API

A robust, admin-centric financial management platform for secure asset and transaction monitoring. Built with Role-Based Access Control (RBAC) to ensure strict data governance — administrators manage users, roles, and financial records with full lifecycle control.

---

## 🚀 Tech Stack

| Layer          | Technology         |
| -------------- | ------------------ |
| Runtime        | Node.js            |
| Language       | TypeScript         |
| Database       | PostgreSQL         |
| ORM            | Prisma             |
| Validation     | Zod                |
| Authentication | JWT + RBAC         |
| Rate Limiting  | express-rate-limit |

---

## 🔄 Platform Workflow

| Step | Role      | Description                                                          |
| ---- | --------- | -------------------------------------------------------------------- |
| 1    | Admin     | Initialize system, create accounts, distribute temporary credentials |
| 2    | All Users | Update temporary credentials on first login                          |
| 3    | Admin     | Full lifecycle control over users and financial records              |
| 4    | Analyst   | Access dashboards, summaries, and transaction trends                 |
| 5    | Viewer    | Read-only access for auditing and monitoring                         |

---

## ⚙️ Setup & Installation

### Prerequisites

Make sure you have the following installed before proceeding:

| Tool       | Version |
| ---------- | ------- |
| Node.js    | `v18+`  |
| PostgreSQL | `v14+`  |
| npm / pnpm | Latest  |

---

### 1. Clone the Repository

```bash
git clone https://github.com/aryanmeher5000/financial_system
cd financial_system
```

---

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then fill in the values:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/your_db_name"

# JWT
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
ADMIN_PASSWORD="password_for_your_admin_account"
ANALYST_PASSWORD="password_for_your_analyst_account"
VIEWER_PASSWORD="password_for_your_viewer_account"
```

---

### 4. Run Database Migrations

```bash
npx prisma migrate dev
```

This will apply all migrations and sync your database schema.

---

### 5. Generate Prisma Client

```bash
npx prisma generate
```

---

### 6. Seed the Database _(optional)_

```bash
npx prisma db seed
```

This will create an initial **ADMIN** user with temporary credentials you can use to log in and provision other users.

---

### 7. Start the Server

**Development**

```bash
npm run dev
```

**Production**

```bash
npm run build
npm start
```

The server will be running at `http://localhost:3000` by default.

---

### 📁 Project Structure

```
src/
├── controller/      # Route handlers
├── middleware/      # Auth, role guards, error handling
├── route/           # Express route definitions
├── service/         # Business logic
├── lib/             # Prisma client instance
├── generated/       # Prisma generated types & enums
├── schema/          # Zod validation schemas
├── startup/         # Startup scripts for app startup
├── utils/           # Utility functions
└── index.ts         # App entry point
```

---

### 🧪 Testing the API

You can test the endpoints using any HTTP client:

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)

Start by hitting `POST /auth/signin` with your admin credentials to get an `accessToken`, then include it as:

```
Authorization: Bearer <accessToken>
```

on all subsequent requests.

---

# API Documentation

## 🔐 Auth Endpoints

### `POST /auth/signin`

Authenticate a user and return access credentials.

**Request Body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response — `200 OK`**

```json
{
  "data": {
    "accessToken": "string"
  }
}
```

**Set Cookie**

| Name           | Description                                |
| -------------- | ------------------------------------------ |
| `refreshToken` | HTTP-only JWT for refreshing access tokens |

**Errors**

| Status | Message                          |
| ------ | -------------------------------- |
| `400`  | Validation error message         |
| `401`  | `"Invalid credentials"`          |
| `401`  | `"User not found"`               |
| `403`  | `"User account was deactivated"` |
| `500`  | `"Internal server error"`        |

---

### `PATCH /auth/updatePassword`

Update the authenticated user's password.

**Request Body**

```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response — `200 OK`**

```json
{
  "message": "Password updated successfully"
}
```

**Errors**

| Status | Message                   |
| ------ | ------------------------- |
| `400`  | Validation error message  |
| `401`  | `"Invalid credentials"`   |
| `401`  | `"No token provided"`     |
| `404`  | `"User not found"`        |
| `500`  | `"Internal server error"` |

---

### `POST /auth/refresh`

Generate a new access token using a valid refresh token.

**Required Cookie**

| Name           | Description                                       |
| -------------- | ------------------------------------------------- |
| `refreshToken` | HTTP-only JWT used to generate a new access token |

**Response — `200 OK`**

```json
{
  "data": {
    "accessToken": "string"
  }
}
```

**Errors**

| Status | Message                              |
| ------ | ------------------------------------ |
| `401`  | `"Invalid or expired refresh token"` |
| `401`  | `"No token provided"`                |
| `403`  | `"User account is deactivated"`      |
| `500`  | `"Internal server error"`            |

---

### `POST /auth/logout`

Invalidate the user's refresh tokens and end the session.

**Required Headers**

| Name            | Description            |
| --------------- | ---------------------- |
| `Authorization` | `Bearer <accessToken>` |

**Required Cookie**

| Name           | Description                 |
| -------------- | --------------------------- |
| `refreshToken` | HTTP-only JWT refresh token |

**Response — `200 OK`**

```json
{
  "message": "Logged out successfully"
}
```

**Errors**

| Status | Message                   |
| ------ | ------------------------- |
| `401`  | `"Unauthorized"`          |
| `404`  | `"User not found"`        |
| `500`  | `"Internal server error"` |

---

### 📌 Auth — Notes

- `accessToken` must be sent as a `Bearer` token in the `Authorization` header on all protected routes.
- `refreshToken` is stored in an HTTP-only cookie and is never exposed to client-side JavaScript.
- Passwords are never returned in any response.
- Logout increments the user's `tokenVersion`, immediately invalidating **all** previously issued refresh tokens.
- Access tokens remain valid until expiry after logout — keep their TTL short (e.g. 15 minutes).
- The client is responsible for clearing locally stored tokens after logout.
- Refresh tokens should be rotated on each use if long-term session security is required.

---

## 👤 User Management Endpoints

> 🔒 All endpoints in this section require an **ADMIN** role.

---

### `GET /user`

Retrieve a paginated list of users with optional filters.

**Query Parameters (Optional)**

| Parameter | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `query`   | `string` | Filter by name or email        |
| `sort`    | `string` | Sort by name — `ASC` or `DESC` |
| `page`    | `number` | Page number to retrieve        |

**Response — `200 OK`**

```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "VIEWER | ANALYST | ADMIN",
      "active": "boolean"
    }
  ]
}
```

---

### `GET /user/:id`

Retrieve a single user by their ID.

**Response — `200 OK`**

```json
{
  "data": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "VIEWER | ANALYST | ADMIN",
    "active": "boolean"
  }
}
```

---

### `POST /user`

Create a new user account with a temporary password.

**Request Body**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "VIEWER | ANALYST | ADMIN"
}
```

**Response — `201 Created`**

```json
{
  "data": {
    "user": {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "VIEWER | ANALYST | ADMIN",
      "createdAt": "string"
    }
  }
}
```

---

### `DELETE /user/:id`

Soft delete a user by ID.

**Response — `200 OK`**

```json
{
  "data": {
    "user": {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "VIEWER | ANALYST | ADMIN"
    }
  }
}
```

---

### `PATCH /user/:id/role`

Update a user's assigned role.

**Request Body**

```json
{
  "role": "VIEWER | ANALYST | ADMIN"
}
```

**Response — `200 OK`**

```json
{
  "data": {
    "user": {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "VIEWER | ANALYST | ADMIN",
      "createdAt": "string"
    }
  }
}
```

---

### `PATCH /user/:id/status`

Activate or deactivate a user account.

**Request Body**

```json
{
  "active": "boolean"
}
```

**Response — `200 OK`**

```json
{
  "data": {
    "user": {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "VIEWER | ANALYST | ADMIN"
    }
  }
}
```

---

### ❌ User Management — Common Errors

| Status | Message                              |
| ------ | ------------------------------------ |
| `401`  | `"Unauthorized"`                     |
| `403`  | `"Forbidden: Admin access required"` |
| `404`  | `"User not found"`                   |
| `500`  | `"Internal server error"`            |

### 📌 User Management — Notes

- All endpoints are protected and require an **ADMIN** role — non-admins receive `403`.
- User deletion is a **soft delete**: the record is flagged with `isDeleted = true` and retained in the database.
- Deactivated users (`active: false`) cannot authenticate or access any endpoints.
- Role changes take effect immediately on the next request by the affected user.
- Admins should apply role escalation carefully to prevent unintended privilege escalation.
- New users receive a temporary password and must update it on first login via `PATCH /auth/updatePassword`.

---

## 💸 Transaction Endpoints

> 🔒 All endpoints require authentication.
> Create, update, and delete actions are restricted to **ADMIN** users only.

---

### `GET /transaction`

Retrieve a paginated, filterable list of transactions.

**Query Parameters (Optional)**

| Parameter   | Type     | Description                                   |
| ----------- | -------- | --------------------------------------------- |
| `category`  | `string` | Filter by category name                       |
| `type`      | `string` | `INCOME` or `EXPENSE`                         |
| `dateFrom`  | `string` | Start date in ISO format (`YYYY-MM-DD`)       |
| `dateTo`    | `string` | End date in ISO format (`YYYY-MM-DD`)         |
| `amountMin` | `number` | Minimum transaction amount                    |
| `amountMax` | `number` | Maximum transaction amount                    |
| `sortBy`    | `string` | Sort field — `createdAt`, `amount`, or `date` |
| `sortOrder` | `string` | `ASC` or `DESC`                               |
| `page`      | `number` | Page number to retrieve                       |

**Response — `200 OK`**

```json
{
  "data": {
    "transactions": [
      {
        "id": "number",
        "amount": "number",
        "category": "string",
        "description": "string",
        "type": "INCOME | EXPENSE",
        "date": "string",
        "createdAt": "string"
      }
    ],
    "page": "number",
    "totalPages": "number"
  }
}
```

---

### `GET /transaction/:id`

Retrieve a single transaction by ID.

**Response — `200 OK`**

```json
{
  "data": {
    "transaction": {
      "id": "number",
      "amount": "number",
      "category": "string",
      "type": "INCOME | EXPENSE",
      "date": "string"
    }
  }
}
```

---

### `POST /transaction` 🔒 Admin Only

Create a new transaction record.

**Request Body**

```json
{
  "amount": "number",
  "category": "string",
  "type": "INCOME | EXPENSE",
  "date": "string",
  "description": "string (optional)"
}
```

**Response — `201 Created`**

```json
{
  "data": {
    "transaction": {
      "id": "number",
      "amount": "number",
      "category": "string",
      "description": "string",
      "type": "INCOME | EXPENSE",
      "date": "string",
      "createdAt": "string"
    }
  }
}
```

---

### `PATCH /transaction/:id` 🔒 Admin Only

Update fields on an existing transaction.

**Request Body**

```json
{
  "amount": "number",
  "category": "string",
  "type": "INCOME | EXPENSE",
  "date": "string",
  "description": "string"
}
```

**Response — `200 OK`**

```json
{
  "data": {
    "transaction": {
      "id": "number",
      "amount": "number",
      "category": "string",
      "description": "string",
      "type": "INCOME | EXPENSE",
      "date": "string",
      "createdAt": "string"
    }
  }
}
```

---

### `DELETE /transaction/:id` 🔒 Admin Only

Permanently delete a transaction record.

**Response — `200 OK`**

```json
{
  "data": {
    "transaction": {
      "id": "number",
      "amount": "number",
      "category": "string",
      "description": "string",
      "type": "INCOME | EXPENSE",
      "date": "string",
      "createdAt": "string"
    }
  }
}
```

---

### ❌ Transaction — Common Errors

| Status | Message                              |
| ------ | ------------------------------------ |
| `401`  | `"Unauthorized"`                     |
| `403`  | `"Forbidden: Admin access required"` |
| `404`  | `"Transaction not found"`            |
| `500`  | `"Internal server error"`            |

### 📌 Transaction — Notes

- `VIEWER` and `ANALYST` roles can read transactions but **cannot** create, update, or delete them.
- Only **ADMIN** users can write to transaction records.
- All `date` fields must be in **ISO 8601** format — e.g. `2026-04-03`.
- All query parameters are optional and can be combined freely for flexible filtering.
- `sortBy` defaults to `createdAt` descending if not specified.
- Transaction deletion is **permanent** — there is no soft delete or recovery mechanism.
- `description` is optional on creation but if provided it must be a non-empty string.

---

## 📊 Summary Endpoints

> 🔒 All endpoints require authentication.

---

### `GET /summary`

Generate a financial summary report for a given date range.

**Query Parameters (Required)**

| Parameter  | Type     | Description                             |
| ---------- | -------- | --------------------------------------- |
| `dateFrom` | `string` | Start date in ISO format (`YYYY-MM-DD`) |
| `dateTo`   | `string` | End date in ISO format (`YYYY-MM-DD`)   |

**Response — `200 OK`**

```json
{
  "data": {
    "totalIncome": "number",
    "totalExpense": "number",
    "netBalance": "number",
    "avgIncome": "number | null",
    "avgExpense": "number | null",
    "savingsRate": "number | null",
    "transactionCount": {
      "total": "number",
      "income": "number",
      "expense": "number"
    },
    "topSpendingCategory": {
      "category": "string",
      "amount": "number"
    }
    "categoryTotals": {
      "<category>": "number"
    },
    "frequentExpenses": [
      {
        "category": "string",
        "count": "number"
      }
    ],
    "largestExpenses": [
      {
        "id": "number",
        "amount": "number",
        "category": "string",
        "date": "string",
        "createdAt": "string",
        "type": "EXPENSE"
      }
    ],
    "spendingByDayOfWeek": {
      "0": "number",
      "1": "number",
      "2": "number",
      "3": "number",
      "4": "number",
      "5": "number",
      "6": "number"
    }
  }
}
```

---

### ❌ Summary — Common Errors

| Status | Message                              |
| ------ | ------------------------------------ |
| `400`  | `"dateFrom and dateTo are required"` |
| `400`  | `"Invalid date format"`              |
| `401`  | `"Unauthorized"`                     |
| `500`  | `"Internal server error"`            |

---

### 📌 Summary — Notes

- **VIEWERS** cannot access this endpoint.
- Both `dateFrom` and `dateTo` are **required** — the endpoint will error without them.
- All dates must be in **ISO 8601** format — e.g. `2026-01-01`.
- All monetary values are rounded to **2 decimal places**.
- `savingsRate` is expressed as a **percentage** — e.g. `42.5` means 42.5% of income was saved. Returns `null` if total income is `0`.
- `avgIncome` and `avgExpense` return `null` if no transactions of that type exist in the range.
- `topSpendingCategory` returns `null` if no transactions exist in the range.
- `spendingByDayOfWeek` keys map to JS `Date.getDay()` values — `0` = Sunday, `1` = Monday ... `6` = Saturday.
- `frequentExpenses` returns the **top 5 expense categories** by transaction count, sorted descending.
- `largestExpenses` returns the **top 5 individual expense transactions** by amount, sorted descending.
- Soft-deleted transactions (`isDeleted: true`) are **excluded** from all calculations.
- If no transactions exist for the given range, a full empty response is returned with a descriptive `message` field instead of an error.

---

# Conclusion

This API provides a complete, role-driven foundation for financial oversight — from credential management and user provisioning to granular transaction control and analytical summaries.
