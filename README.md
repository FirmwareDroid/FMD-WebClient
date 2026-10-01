# FirmwareDroid Client

FirmwareDroid is an analysis platform for Android firmware. This repository contains the modern React/Vite web frontend for FirmwareDroid.

## Getting Started & Development

Development uses **Vite Hot Module Replacement (HMR)** proxied through the local FirmwareDroid Nginx reverse proxy at `https://fmd.localhost`. This preserves full production security parity (`SameSite=Strict`, `Secure` cookies, CSRF protection, and backend GraphQL/REST endpoints) while providing instant live reloads on change.

### Prerequisites

1. Follow the [Getting Started guide](https://firmwaredroid.github.io/posts/getting-started/) to clone and set up the FirmwareDroid backend repository:
   ```shell
   git clone https://github.com/FirmwareDroid/FirmwareDroid.git
   ```
2. Node.js (v20+ recommended) and [Yarn](https://classic.yarnpkg.com/) (`yarn` v1.22.x).

---

### Step 1: Start the FirmwareDroid Backend

In your `FirmwareDroid` repository directory, start the development Docker Compose stack:

```shell
cd FirmwareDroid
docker compose up -d
```

> [!NOTE]
> The development `docker-compose.yml` has frontend dev-proxying enabled by default (`FRONTEND_DEV_PROXY=true`). Nginx listens on `https://fmd.localhost` and reverse-proxies web requests and HMR WebSockets (`wss://`) to the Vite dev server running on your host (`http://host.docker.internal:5173`).

---

### Step 2: Install Dependencies & Start the Dev Server

In your `FMD-WebClient` directory:

```shell
cd FMD-WebClient

# Install dependencies (frozen lockfile)
yarn install --frozen-lockfile

# Start the Vite development server with HMR
yarn dev
```

The Vite dev server will start listening on `http://localhost:5173`.

---

### Step 3: Open the Web Application

Navigate to **`https://fmd.localhost`** in your browser.

- All React code and styles update in **real-time** as you save files (HMR).
- Backend APIs (`/graphql`, `/csrf`, `/api-auth/`, `/django-rq`, `/admin`) are served directly by the backend containers with valid TLS and authentication cookies.
- If the Vite dev server is stopped, Nginx will display a friendly notice reminding you to run `yarn dev`.

---

## Building for Production

To create an optimized production bundle:

```shell
yarn build
```

The compiled assets will be output to the `build/` directory.

---

## Quality Checks

Run the complete frontend verification suite before opening a pull request:

```shell
yarn typecheck
yarn lint
yarn test
yarn build
yarn audit --groups dependencies
```

Yarn Classic and `yarn.lock` are the project's package-management source of truth.

## Security & Parity

- **Strict Cookies & CSRF**: All communication with the backend passes through `https://fmd.localhost`. Browser cookies (`SameSite=Strict`, `Secure`) and Django `CSRF_TRUSTED_ORIGINS` operate exactly as in production.
- **DNS Rebinding Protection**: Vite `allowedHosts` is configured to accept requests only from `fmd.localhost` and local loopback addresses.
- **Production Headers**: The production Nginx reverse proxy enforces `X-Content-Type-Options: nosniff`, restrictive Content Security Policy, and frame embedding protections. Credentials must never be placed in frontend environment variables, browser storage, query strings, or WebSocket URLs.
