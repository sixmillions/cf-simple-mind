# GEMINI.md

## Project Overview

This project is a subscription reminder service built as a Cloudflare Worker application. It allows users to create "minds" (reminders) with a title, description, and scheduled time. These minds can be associated with different "triggers," such as sending an email or a DingTalk message.

The application is written in TypeScript and uses the [Hono](https://hono.dev/) web framework. It leverages Cloudflare KV for data storage, including minds, triggers, and a history of recently executed minds. The frontend is a single HTML page (`public/index.html`) that interacts with the backend API.

The core logic is in `src/index.ts`, which defines the API routes and a scheduled cron job. The cron job runs every hour, checks for minds that are due within the next three hours, and executes the corresponding triggers.

## Building and Running

### Development

To run the application in a local development environment, use the following command:

```bash
npm run dev
```

This will start a local server that simulates the Cloudflare environment.

### Deployment

To deploy the application to Cloudflare, use the following command:

```bash
npm run deploy --minify
```

This will build, minify, and deploy the worker to the configured Cloudflare account.

### Type Generation

To generate TypeScript types for the Cloudflare bindings (like KV namespaces), run:

```bash
npm run cf-typegen
```

## Development Conventions

*   **API:** The backend API is organized into modules within the `src/api/` directory. The main router is in `src/index.ts`.
*   **Triggers:** Trigger logic (e.g., sending emails, DingTalk messages) is located in the `src/trigger/` directory.
*   **Data Storage:** The application uses a single Cloudflare KV namespace with the binding `subscribe_mind`. Data is stored as JSON strings.
*   **Frontend:** The user interface is a single HTML file (`public/index.html`) that makes API calls to the backend.
*   **Authentication:** A simple token-based authentication is used. The token is stored in the browser's local storage.
*   **Scheduled Tasks:** A cron job is configured in `wrangler.jsonc` to run every hour (`"0 */1 * * *"`). The logic for the scheduled task is in the `scheduled` function in `src/index.ts`.
