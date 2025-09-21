# CLAUDE.md

This file provides guidance when working on the AI Retro codebase.

## Development commands

### Core development
- pnpm dev - start the development server with content collections
- pnpm build - build the application and content collections
- pnpm start - run the production server
- pnpm lint - lint with Biome
- pnpm format - format with Biome

### Database operations (Drizzle ORM)
- pnpm db:generate - generate a new migration from schema changes
- pnpm db:migrate - apply pending migrations
- pnpm db:push - sync schema directly to the database (development only)
- pnpm db:studio - open Drizzle Studio for inspection

### Content and email
- pnpm content - rebuild MDX content collections
- pnpm email - start the email template preview server on port 3333

## Project architecture

AI Retro is a Next.js 15 full-stack application with these key components:

- **Framework**: Next.js 15 with the App Router
- **Database**: PostgreSQL via Drizzle ORM
- **Authentication**: Better Auth with Google and GitHub providers
- **Payments**: Stripe for subscriptions, one-time credits, and customer portal
- **UI**: Radix UI + TailwindCSS
- **State management**: Zustand on the client
- **Internationalization**: next-intl with English and Chinese locales
- **Content**: MDX collections that power the AI Retro docs, blog, and legal pages
- **Code quality**: Biome for formatting and linting

Keep translations in messages/en.json and messages/zh.json synchronized when modifying shared UI, and prefer updating content through the MDX collections inside /content.
