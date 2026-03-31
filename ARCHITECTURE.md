# Snippitt Architecture & Contribution Guide

Welcome to the Snippitt codebase! This document serves as a guide for contributors and developers, detailing not just *what* our application uses, but *why* we made certain architectural decisions. 

Understanding our history and design philosophy is key to maintaining a highly performant, clean codebase.

---

## 1. Architectural Philosophy & History

### Moving Away from Traditional REST APIs
In earlier iterations of Snippitt, we relied heavily on traditional REST API routes (`/api/...`) and client-side data fetching. This approach quickly led to significant performance bottlenecks—most notably the **N+1 query problem** on the client side. 

For example, when rendering a feed of posts, the client would first fetch the list of posts, and then for *each* individual post, the client would make subsequent API calls just to fetch its specific like count, comment count, and author details. This resulted in dozens of unnecessary network requests, waterfall loading delays, and excessive database strain just to render a single feed.

### The Server-First Solution
To solve this, we completely re-architected the app around the **Next.js App Router (Server Components & Server Actions)**:

- **Aggregated Server-Side Fetching**: Instead of the client making multiple requests, our Server Components now perform sophisticated, aggregated Prisma queries directly on the server. We fetch a post along with all its relational data (like counts, comment counts, and author info) in a *single database trip* using Prisma's `include` and `_count` features.
- **Eliminating the Middleman**: By co-locating our data fetching within our layout and page Server Components, we have largely eliminated the need for a dedicated internal REST API layer. Data is passed directly to Client Components as static props.
- **Server Actions for Mutations**: All state mutations (liking a post, creating a comment, saving to a collection) are handled via Next.js Server Actions situated in the `/actions` directory. This keeps our client JS bundle small and ensures security logic remains firmly executed on the server.

---

## 2. Technology Stack

Snippitt is built using the latest industry standards:

- **Core Framework**: Next.js (App Router) v15/16 with React 19
- **Language**: TypeScript (Strict mode)
- **Database ORM**: Prisma (connected to PostgreSQL)
- **Authentication**: NextAuth.js (`next-auth`)
- **Styling**: Tailwind CSS (v4) + Framer Motion for UI animations
- **Type Validation**: Zod
- **Rate Limiting**: Upstash Redis (`@upstash/ratelimit`)
- **File Storage**: AWS S3 (`@aws-sdk/client-s3`)

---

## 3. Directory Structure & Conventions

When navigating or contributing to the repository, keep the following folder conventions in mind:

- `/app`: The core routing directory.
  - Rely heavily on **Server Components** here. Only use `"use client"` when interactivity (hooks, state, event listeners) is absolutely necessary.
  - `/app/(routes)`: Route groups used to logically separate UI sections without affecting the URL path.
- `/actions`: Contains all Next.js **Server Actions**. This is where the core business logic resides.
- `/components`: Reusable UI components used across multiple pages.
- `/lib`: Utility functions and singletons.
  - `prisma.ts`: Initializes the Prisma client.
  - `ratelimit.ts`: Upstash Redis rate limiter setup.
- `/prisma`: Contains `schema.prisma` which defines all our PostgreSQL database models.
- `/hooks`: Custom React hooks specifically for client-side logic.
- `/types`: Global TypeScript interfaces.

---

## 4. The Server Actions Pattern

When writing or modifying a Server Action in the `/actions` directory, **always adhere to our standard 5-step pattern**. 

### Standard Action Return Signature
Every server action should return a consistent object. This allows Client Components to easily handle loading, success, and error states (e.g., triggering a Sonner toast):

```typescript
{
  success: boolean;
  message?: string; // Provide on success
  error?: string;   // Provide on failure
  code?: string;    // Actionable code (e.g., "UNAUTHORIZED", "RATE_LIMIT_EXCEEDED")
  data?: any;       // The requested data or created entity
}
```

### The 5-Step Implementation Flow

Whenever you create a new action (e.g., `createComment`, `toggleLike`), structure your function exactly like this:

1. **Header Parsing & Rate Limiting**
   Protect write-heavy actions with Upstash rate limiting using the requester's IP to prevent abuse.
   ```typescript
   const headerList = await headers();
   const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";
   const rateLimit = await checkRateLimit("action_name", ip, "social");
   
   if (!rateLimit.success) {
     return { success: false, error: "Too many requests", code: "RATE_LIMIT_EXCEEDED" };
   }
   ```

2. **Input Validation**
   Never trust client input. Validate strings/IDs or use Zod for complex objects.
   ```typescript
   if (!postId || typeof postId !== "string") {
     return { success: false, error: "Invalid post ID", code: "INVALID_INPUT" };
   }
   ```

3. **Authentication & Authorization**
   Verify the user is logged in. If they are mutating an existing record, verify they *own* that record via a database check.
   ```typescript
   const user = await getSession();
   if (!user?.id) {
     return { success: false, error: "User not authenticated", code: "UNAUTHORIZED" };
   }
   ```

4. **Database Operation (Prisma)**
   Perform the necessary CRUD operations. Use standard Prisma queries. If multiple tables are affected (e.g., deleting a comment and updating a stat table), use `prisma.$transaction`.
   ```typescript
   const comment = await prisma.comment.create({
     data: { postId, content, userId: user.id },
   });
   ```

5. **Side Effects & Return**
   Trigger any side effects (like generating user Notifications) and return the standard success object. Wrap the entire function body in a `try/catch` block to handle unexpected panics cleanly.

---

## 5. Database Schema Overview

Our data model centers around a standard content-sharing platform:

- **User**: The central entity. Can create Posts, Collections, Comments, and Follow other users.
- **Post**: Represents a piece of content. Posts belong to a User, have a `Category` and `Visibility` status, and can contain multiple `Image`s.
- **Collection**: A logical grouping of Posts curated by a User.
- **Interactions**: We track `Like`, `Comment`, `SavedPost`, and `HighlightedPost` as relational join tables between Users and Posts.
- **Notification**: Alerts triggered by social actions (Likes, Comments, Follows).

> **Prisma Tip**: Always use `onDelete: Cascade` in Prisma schemas for relational integrity. For example, when a Post is deleted, all its associated Comments and Likes must automatically be deleted by the database.

---

## 6. How to Contribute a New Feature

If you are picking up a ticket to build a new feature (e.g., "User Bookmarks"), follow this workflow:

1. **Schema First**: Update `/prisma/schema.prisma` to add the necessary models/fields. Run `npx prisma db push` or `prisma migrate dev` locally to sync your database.
2. **Actions Second**: Create a file in `/actions` (e.g., `/actions/bookmarks.ts`). Write your mutations and queries following the Server Action pattern above. Do **not** create a `/api/...` route unless it's a webhook for an external service.
3. **Components Third**: Build your UI in `/app` or `/components`. Connect your buttons/forms to the Server Actions. 
4. **Deploy**: Our standard `build` script in `package.json` will automatically run `prisma generate` and `prisma migrate deploy` prior to `next build`, ensuring database safety during CI/CD.
