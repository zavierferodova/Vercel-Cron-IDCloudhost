# IDCloudHost VM Controller (Vercel)

This project is an Express.js API designed to manage Virtual Machines (VMs) on IDCloudHost. It connects to a PostgreSQL database using Prisma ORM to schedule cron jobs (start/stop VMs) and provides an API to list and retrieve VM details.

It's configured to run both as a standalone Express server (for local development and production) and as a Vercel Serverless Function.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL Database
- [IDCloudHost API Token](https://console.idcloudhost.com/)

## Environment Setup

Create a `.env` file in the root directory and populate it with your configuration:

```env
# Database connection string
# Example: postgresql://postgres:password@localhost:5432/idcloudhost_vm
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# The port your server will run on locally
PORT=3000

# Your custom secret key to protect this API
API_KEY="my-secret-api-key"

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

To run the application in development mode with hot-reloading (using `nodemon` and `tsx`):

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured `PORT`). Any changes to files in the `src` or `api` directories will automatically restart the server.

## Production Mode (Standalone Server)

To build and run the application for a traditional production environment (e.g., VPS, Docker, PM2):

```bash
# 1. Compile TypeScript to JavaScript in the /dist folder
npm run build

# 2. Start the compiled production server
npm run start
```

## Production Mode (Vercel Deployment)

This repository is pre-configured to be deployed as a Vercel Serverless Function via the `api/index.ts` file.

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` to link the project and deploy to a preview URL.
3. Don't forget to add your Environment Variables (`DATABASE_URL`, `API_KEY`, etc.) in the Vercel Dashboard under **Settings > Environment Variables**.
4. Run `vercel --prod` to deploy to production.

## API Usage Example

Remember to pass your `API_KEY` in the headers for all requests:

```bash
curl -X GET http://localhost:3000/api/vms \
  -H "x-api-key: my-secret-api-key"
```
