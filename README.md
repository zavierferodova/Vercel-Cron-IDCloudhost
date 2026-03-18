# Vercel Cron IDCloudHost VM Controller

This project is an Express.js API designed to manage Virtual Machines (VMs) on IDCloudHost. It connects to a PostgreSQL database using Prisma ORM to schedule cron jobs (start/stop VMs), heavily tailored to run on **Vercel Serverless Functions** and leverage **Vercel Cron Jobs**. 

It implements a Clean Architecture (Domain, Application, Infrastructure, Presentation) and provides APIs to list VMs, create schedules, and process cron triggers.

## Features

- **List VMs:** Fetch running/stopped VMs from your IDCloudHost account.
- **Set VM Schedules:** Schedule VMs to start or stop automatically. 
- **Flexible Cron Expressions:** Supports standard Cron expressions (e.g. `0 9 * * *`), or simplified `morning` and `night` phases mapped directly to Vercel's Cron configurations.
- **RESTful Endpoints:** Full CRUD for managing schedules per VM.
- **Vercel native:** Automatically secures HTTP endpoints using `CRON_SECRET` for cron jobs, and `API_KEY` for standard management.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL Database
- [IDCloudHost API Token](https://console.idcloudhost.com/)
- An active Vercel Project

## Environment Setup

Create a `.env` file in the root directory and populate it with your configuration:

```env
# Database connection string
# Example: postgresql://postgres:password@localhost:5432/idcloudhost_vm
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# The port your server will run on locally (Not needed on Vercel)
PORT=3000

# Your custom secret key to protect this API (Client requests)
API_KEY="my-secret-api-key"

# Required for Vercel Cron Authentication (Vercel sets this up automatically in prod)
CRON_SECRET="my-cron-secret"

# Your IDCloudHost API Token
IDCLOUDHOST_API_TOKEN="your-idcloudhost-token"
```

## Database Setup (Prisma)

Before running the application, you need to apply the database schema to your PostgreSQL database and generate the Prisma Client.

```bash
# Apply schema to database (useful for rapid development)
npx prisma db push

# Generate Prisma Client (required for TypeScript)
npx prisma generate
```

## Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured `PORT`). Any changes to files in the `src` or `api` directories will automatically restart the server.

## API Reference

All requests must be authenticated. You can authorize by passing your API Key in the `x-api-key` header or as a Bearer token in the `Authorization` header.

### Endpoints

- `GET /api/vms`
  List all VMs.
- `GET /api/vms/:uuid`
  Get details for a specific VM UUID.
- `GET /api/vms/schedules`
  Get a list of **all** schedules globally across all VMs.
- `GET /api/vms/:uuid/schedule`
  Get schedules specific to the VM UUID.
- `POST /api/vms/:uuid/schedule`
  Create or update a schedule. 
  *Body:*
  ```json
  {
    "action": "start", // or "stop"
    "cronExpression": "morning", // "morning", "night", or standard cron e.g., "0 9 * * *"
    "timezone": "Asia/Jakarta", // optional
    "isActive": true // optional
  }
  ```
- `DELETE /api/vms/:uuid/schedule`
  Delete a specific schedule.
  *Body or Query Parameter:* `?action=start` or `?action=stop`
- `GET /api/cron`
  The webhook consumed periodically by Vercel to trigger schedules. Can optionally pass `?phase=morning` to execute all "morning" specific jobs.

## Production Mode (Standalone Server)

To build and run the application for a traditional production environment (e.g., VPS, Docker, PM2):

```bash
# 1. Compile TypeScript to JavaScript in the /dist folder
npm run build

# 2. Start the compiled production server
npm run start
```

## Production Mode (Vercel Deployment)

This repository is pre-configured to be deployed as a Vercel Serverless Function via the `api/index.ts` file and `vercel.json` configuration config.

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` to link the project and deploy to a preview URL.
3. Add your Environment Variables (`DATABASE_URL`, `API_KEY`, `IDCLOUDHOST_API_TOKEN`) in the Vercel Dashboard under **Settings > Environment Variables**.
4. Run `vercel --prod` to deploy to production.

## Vercel Cron Jobs

Vercel will ping the `/api/cron` endpoint at the cadence defined in `vercel.json`. The codebase supports parsing both valid standard cron expressions and specialized phase string values (e.g., `morning`, `night`), ensuring VMs start precisely when needed without constantly pinging IDCloudHost resources.
