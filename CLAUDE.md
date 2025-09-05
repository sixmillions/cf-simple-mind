# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a subscription reminder application built with Hono.js for Cloudflare Workers. The application allows users to create reminders (called "minds") with titles, descriptions, scheduled times, and triggers. It supports email and DingTalk notifications.

## Architecture

- Backend: Hono.js running on Cloudflare Workers
- Frontend: Single HTML page (public/index.html) with embedded JavaScript
- Data Storage: Cloudflare KV (Key-Value store)
- Authentication: Token-based authentication
- Triggers: Cron job that runs every hour to check and send reminders

## Key Components

1. **Main Entry Point**: `src/index.ts` - Sets up the Hono app and routes
2. **API Routes**: 
   - `src/api/apiAuth.ts` - Authentication endpoint
   - `src/api/apiMind.ts` - CRUD operations for reminders/minds
   - `src/api/apiTrigger.ts` - CRUD operations for trigger configurations
   - `src/api/apiHistory.ts` - Execution history tracking
   - `src/api/apiDemo.ts` - Demo endpoints for testing email and DingTalk notifications
3. **Trigger Implementations**:
   - `src/trigger/sendEmail.ts` - Email notification service
   - `src/trigger/dingTalkRobt.ts` - DingTalk robot notification service
4. **Types**: `src/types.ts` - TypeScript interfaces for data structures
5. **Configuration**: `wrangler.jsonc` - Cloudflare Worker configuration
6. **Frontend**: `public/index.html` - Single page application with all UI logic

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to Cloudflare
npm run deploy

# Generate Cloudflare types
npm run cf-typegen
```

## Data Structure

### Minds (Reminders)
- Stored in KV with key "mind" as a JSON object
- Each mind has:
  - id: Unique identifier
  - title: Reminder title
  - description: Reminder description
  - time: Scheduled time for the reminder
  - trigger: Array of trigger keys to execute
  - createdAt: Creation timestamp
  - updatedAt: Last update timestamp

### Triggers
- Stored in KV with key "trigger" as a JSON object
- Each trigger has a key and configuration object
- Two supported trigger types:
  - Email: Configuration includes recipient email address
  - DingTalk: Configuration includes webhook URL

### History
- Stored in KV with key "history" as a JSON object
- Contains array of last 10 execution records
- Each record includes:
  - id: Mind ID
  - title: Mind title
  - executionTime: When the mind was executed
  - status: Execution status
  - trigger: The trigger that was executed

## Authentication

- Token-based authentication using Bearer tokens
- Default token is "6000000" (configured in wrangler.jsonc)
- Authentication is required for all API endpoints except /api/auth
- Each API request must include Authorization: Bearer [token] header

## Cron Job

- A cron job runs every hour (0 */1 * * *)
- Checks all minds to see if any should be triggered based on their scheduled time (within 3 hours)
- Executes configured triggers for matching minds
- Records execution history for each trigger execution
- Uses Shanghai timezone for time comparisons

## Frontend Structure

- All frontend code is in `public/index.html`
- Single page application with header/content/footer layout
- Content area has left and right sections:
  - Left: Mind creation/editing form and list
  - Right: Trigger configuration and execution history
- Dark/light mode toggle functionality
- Login/Logout functionality with token management in localStorage
- Embedded JavaScript handles all UI interactions and API calls

## Important Notes

- Each time an interface is modified, the swagger documentation must be updated to ensure consistency between interface and documentation
- All data is stored in Cloudflare KV store
- The application is deployed as a Cloudflare Worker
- The cron job uses Shanghai timezone for time comparisons
- Error handling and logging is implemented throughout the application
- The frontend is a single HTML file with embedded CSS and JavaScript
- All API endpoints are protected with bearer token authentication