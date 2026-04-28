# Booky – Library Web App

A library app where users can browse books, borrow them, write reviews, and track loan history. Built with React + TypeScript and connected to a real REST API.

## Tech Stack

- **React 18 + TypeScript** — UI + type safety
- **Tailwind CSS v3 + shadcn/ui** — styling and component library
- **Redux Toolkit** — user session and UI filter state
- **TanStack Query** — data fetching, caching, and mutations
- **Axios** — HTTP client with auth interceptor
- **Day.js** — date formatting
- **Sonner** — toast notifications
- **React Router v6** — routing

## Pages

| Page | What it does |
|---|---|
| Login / Register | Auth forms, token saved to localStorage |
| Browse Books | Search, category filter, pagination |
| Book Detail | Borrow book, read/write reviews, see stock |
| My Loans | Loan history with status and return button |
| My Profile | Edit profile, view borrowing stats |

## Project Structure

```
src/
├── api/          # one file per resource (books, loans, reviews, etc.)
├── components/   # Layout, BookCard, StarRating, shadcn/ui components
├── hooks/        # useBooks, useBookDetail, useMyLoans, useDebounce
├── pages/        # one file per route (UI only, no query logic)
├── store/        # authSlice (user), uiSlice (search/filter)
└── types/        # TypeScript interfaces
```

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

**Test account:** `admin@library.local` / `admin123`

---

## Improvements

### 1. Token as single source of truth
The auth token is stored only in localStorage and read exclusively by the Axios request interceptor. It is no longer duplicated in Redux state. Redux only holds the `user` object (name, role, etc.) for UI use. On a 401 response, the interceptor dispatches `logout()` to clear both the token and user atomically, so there is no stale state after a session expires.

### 2. Optimistic UI with rollback
Borrow and delete-review mutations update the UI instantly before the server responds. `onMutate` snapshots the current cache and applies the optimistic change. `onError` restores the snapshot if the request fails. `onSettled` always runs query invalidation so the UI re-syncs with the server regardless of success or failure.

### 3. Consistent query invalidation
Every mutation invalidates all affected query keys in `onSettled` — not just `onSuccess`. For example, borrowing a book invalidates `["book", id]`, `["books"]` (list page availability count), and `["loans"]`.

### 4. Custom hooks for all query logic
Query and mutation logic is extracted into dedicated hooks:
- `useBooks` — books list + category filter queries
- `useBookDetail` — book detail + reviews queries + borrow/review/delete mutations
- `useMyLoans` — loans query + return mutation

Pages are now thin UI shells with no direct `useQuery` or `useMutation` calls.

### 5. Consistent error states across all pages
Every page renders a skeleton during loading, a friendly error message with a **Try again** button on failure, and an empty state when there is no data. The retry button calls `refetch()` directly so users can recover without a full page reload.

---

## Challenges I ran into

### 1. Swagger page returned empty HTML
The API docs at `/api-swagger` is a JavaScript-rendered SPA, so fetching it directly just gives an empty shell. I tried common spec URLs (`/swagger.json`, `/openapi.json`) but they all 404'd. Eventually found the full OpenAPI spec embedded inside the Swagger init script at `/api-swagger/swagger-ui-init.js` — parsed it from there.

### 2. Tailwind v4 broke the build
Running `npm install tailwindcss` silently pulled in v4, which is a full rewrite with a different PostCSS setup and no `tailwind.config.ts`. Everything broke. Since I was using shadcn/ui which targets v3 conventions, the fix was just pinning to `tailwindcss@3`.

### 3. Cover images are base64 strings, not URLs
The API sends images as base64-encoded JPEGs, not file paths. The responses were 100KB+ per book. Used `data:` URIs directly in `<img src>` (browsers handle it natively) and added `loading="lazy"` so images only decode when scrolled into view.

### 4. Review field is `star`, not `rating`
The Book schema uses `rating` for the average score, so I assumed reviews would too. But the actual API response used `star`. Caught it by testing the endpoint with `curl` before writing any frontend code. TypeScript wouldn't have caught this — both fields are `number`, so there's no type error, just silent wrong data.

### 5. Redux vs TanStack Query — what goes where
Both can hold data so it's easy to duplicate state. My rule: Redux only for things that don't come from the server (user session, search string, selected filter). TanStack Query for everything fetched from the API (books, loans, reviews, profile) — it handles loading/error states and cache invalidation automatically.

### 6. Optimistic UI for borrowing
After clicking "Borrow", I didn't want to wait 1–2s for the server before updating the stock count. Used TanStack Query's `onMutate` to snapshot the current data and immediately decrement the count in the cache. If the server request fails, `onError` restores the snapshot. Also had to `cancelQueries` first to stop any in-flight refetch from overwriting the optimistic update.

### 7. 401 handling without repeating code everywhere
Instead of checking for expired tokens in every component, I added a single response interceptor on the Axios instance. Any 401 from any endpoint dispatches `logout()` (clears both token and user) and redirects to `/login`. Used `window.location.href` instead of React Router's `navigate()` because the interceptor runs outside the React tree and can't use hooks.
