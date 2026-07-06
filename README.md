# Lost & Found

A campus-focused lost and found web application built with Next.js and MongoDB.

Users can register, report lost or found items, browse reports, submit claims, and follow a secure return flow. Admins and staff can manage item status and user accounts.

## Features

- User authentication: signup, login, email verification, password reset
- Lost and found report submission with image upload
- Browse found and lost items with detail pages
- Claim management for owners and finders
- Admin dashboard for reviewing reports and updating status
- Role-based access control for students, security, and admins
- Cloudinary image uploads and email notifications

## Tech Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- MongoDB / Mongoose
- JWT authentication
- Cloudinary for file uploads
- Nodemailer / SMTP for email flows

## Getting Started

### Install dependencies

```bash
cd lost_found
npm install
```

### Configure environment variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required values:

- `MONGO_URI` — MongoDB connection string
- `TOKEN_SECRET` — JWT signing secret
- `DOMAIN` — app domain, e.g. `http://localhost:3000`
- `SMTP_SERVICE`, `SMTP_USER`, `SMTP_PASS` — email provider settings
- `MAIL_FROM` — sender address for notification emails

### Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` — start development server
- `npm run build` — build production app
- `npm run start` — start production server
- `npm run lint` — run ESLint checks

## Folder Structure

- `app/` — Next.js App Router pages, API routes, and UI layout
- `lib/` — helper utilities and configuration
- `models/` — Mongoose schemas for users, lost items, found items, and claims
- `components/` — UI components and reusable controls
- `public/` — static assets

## Environment Notes

- The app stores authentication tokens in HTTP-only cookies for secure sessions.
- Images are uploaded through `app/api/upload/route.ts` using Cloudinary.
- MongoDB is connected in `app/db/dbConfig.ts`.

## About

This repository is built to support a community-driven lost and found system for campus users, with a clean modern UI and admin controls for managing recovery workflows.
