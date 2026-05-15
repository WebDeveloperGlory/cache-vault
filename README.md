# CacheVault — Backend API

A Node.js/TypeScript REST API demonstrating Redis caching patterns (cache-aside, TTL management, invalidation) with a clean architecture structure.

---

## Tech Stack

| Layer            | Technology                                            |
| ---------------- | ----------------------------------------------------- |
| Runtime          | Node.js + TypeScript                                  |
| Framework        | Express                                               |
| Database         | MongoDB + Mongoose                                    |
| Cache            | Redis (`node-redis` v4)                               |
| Auth             | JWT (access token) + HTTP-only cookie (refresh token) |
| Validation       | Zod                                                   |
| Password hashing | bcrypt                                                |

---

## Architecture

```
src/
├── modules/
│   ├── auth/
│   │   ├── application/
│   │   │   ├── dtos/
│   │   │   └── services/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── errors/
│   │   │   └── interfaces/
│   │   ├── infrastructure/
│   │   │   ├── http/
│   │   │   └── persistence/
│   ├── products/
│   │   ├── application/
│   │   │   ├── dtos/
│   │   │   └── services/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── errors/
│   │   │   └── interfaces/
│   │   ├── infrastructure/
│   │   │   ├── http/
│   │   │   └── persistence/
│   └── users/
│       ├── application/
│       │   ├── dtos/
│       │   │   └── user.dto.ts
│       │   └── services/
│       │   │   └── user.service.ts
│       ├── domain/
│       │   ├── entities/
│       │   │   └── user.entity.ts
│       │   ├── errors/
│       │   │   └── user.errors.ts
│       │   └── interfaces/
│       │       └── user.repository.interface.ts
│       └── infrastructure/
│           ├── http/
│           │   ├── user.controller.ts
│           │   └── user.routes.ts
│           └── persistence/
│               ├── refresh-token.model.ts
│               ├── user.interface.ts
│               └── user.model.ts
├── routes/
│   └── index.ts
├── shared/
│   ├── cache/
│   │   ├── product.cache.ts
│   │   └── user.cache.ts
│   ├── config/
│   │   ├── env.config.ts         # Typed env vars
│   │   ├── mongoose.config.ts    # MongoDB singleton
│   │   └── redis.config.ts       # Redis singleton (RedisClient class)
│   ├── errors/
│   │   └── app.error.ts      # AppError hierarchy
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   ├── rate-limiter.middleware.ts
│   │   └── validation.middleware.ts
│   ├── types/
│   │   ├── common.types.ts
│   │   └── express.d.ts
│   └── utils/
│       └── logger.util.ts
├── server.ts
└── app.ts
```

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/cachevault
MONGO_TEST_URI=mongodb://localhost:27017/cachevault_test

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## API Routes

### Auth  `BASE: /api/v1/auth`

| Method | Route              | Auth   | Description                                                            |
| ------ | ------------------ | ------ | ---------------------------------------------------------------------- |
| `POST` | `/register`        | —      | Register new user, returns access token + sets refresh cookie          |
| `POST` | `/login`           | —      | Login, returns access token + sets refresh cookie                      |
| `POST` | `/logout`          | ✓      | Revoke refresh token(s). Body: `{ allDevices: boolean }`               |
| `POST` | `/token/refresh`   | cookie | Silent refresh — reads `refreshToken` cookie, returns new access token |
| `GET`  | `/me`              | ✓      | Get current user profile (cached, returns `fromCache` flag)            |
| `POST` | `/password/change` | ✓      | Change password. Body: `{ oldPassword, newPassword }`                  |

### Products  `BASE: /api/v1/product`

| Method   | Route           | Auth | Description                                                               |
| -------- | --------------- | ---- | ------------------------------------------------------------------------- |
| `GET`    | `/`             | —    | List all products (paginated). Query: `page`, `limit`, `user`, `category` |
| `POST`   | `/`             | ✓    | Create product                                                            |
| `GET`    | `/personal`     | ✓    | My own product listings. Query: `page`, `limit`, `category`               |
| `GET`    | `/category/:id` | —    | Products by category (cached). Returns `categoryViews` + `fromCache`      |
| `GET`    | `/:id`          | —    | Single product (cached). Returns `fromCache` flag                         |
| `PUT`    | `/:id`          | ✓    | Update product. Invalidates item + list + category caches                 |
| `DELETE` | `/:id`          | ✓    | Delete product (204). Invalidates related caches                          |

### Users  `BASE: /api/v1/user`

| Method | Route  | Auth | Description                                                            |
| ------ | ------ | ---- | ---------------------------------------------------------------------- |
| `GET`  | `/`    | ✓    | List all users (paginated). Query: `page`, `limit`, `role`, `isActive` |
| `GET`  | `/:id` | ✓    | Get user by ID                                                         |

---

## Caching Design

### Cache Keys

```
product:all                        — full product list (TTL: 60s)
product:<id>                       — single product (TTL: 300s)
product:category:<categoryName>    — products per category (TTL: 120s)
auth:me:<userId>                   — current user profile (TTL: 300s)
```

### Cache-Aside Pattern (reads)

```
1. Check Redis for key
2. HIT  → return cached value (fromCache: true)
3. MISS → query MongoDB
4. Store result in Redis with TTL
5. Return data (fromCache: false)
```

### Invalidation (mutations)

On `PUT /:id` or `DELETE /:id`:
```
→ delete product:<id>
→ delete product:all
→ delete product:category:<category>
```

This ensures the next read reflects the updated DB state.

---

## Response Structure

### Success
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Paginated success
```json
{
  "success": true,
  "message": "...",
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 15,
  "totalPages": 3,
  "fromCache": true
}
```

### Error
```json
{
  "success": false,
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

### Zod validation error
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

---

## Auth Flow

1. `POST /auth/login` → server sets `refreshToken` in an HTTP-only cookie, returns `accessToken` in body.
2. Client stores `accessToken` in memory (Zustand store, not localStorage).
3. Every request attaches `Authorization: Bearer <accessToken>` header.
4. On 401, the axios interceptor calls `POST /auth/token/refresh`. The browser sends the cookie automatically (`withCredentials: true`).
5. On refresh success: new `accessToken` stored, original request retried.
6. On refresh failure: auth state cleared, redirect to `/login`.

---

## Running Locally

```bash
# Prerequisites: MongoDB running, Redis running

npm install

# Development
npm run dev

# Production build
npm run build
npm start
```

---

## Error Codes Reference

| Code                         | HTTP | Description                                        |
| ---------------------------- | ---- | -------------------------------------------------- |
| `NOT_FOUND`                  | 404  | Resource not found                                 |
| `VALIDATION_ERROR`           | 400  | Zod or Mongoose validation failure                 |
| `UNAUTHORIZED`               | 401  | Missing or invalid token                           |
| `FORBIDDEN`                  | 403  | Insufficient permissions                           |
| `CONFLICT`                   | 409  | Duplicate resource (e.g. email already registered) |
| `INVALID_VERIFICATION_TOKEN` | 400  | Bad token                                          |
| `VERIFICATION_TOKEN_EXPIRED` | 410  | Token has expired                                  |

---

*Backend for [CacheVault](../cache-vault) frontend.*
