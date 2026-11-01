# Copilot instructions for Good Story

## Project overview

Good Story is a Vite + React movie discovery app. The app boots in `src/main.jsx` with `BrowserRouter`, and the route tree is:

- `/` -> `src/pages/Home.jsx`
- `/movie/:id` -> `src/pages/MovieDetails.jsx`

The shared app shell in `src/App.jsx` renders the page layout and the routed content via `Outlet`. Most UI state is page-local and kept in React hooks, while the URL syncs critical filters such as search query, page number, and sort option.

The data flow is split between two external services:

- TMDB (The Movie Database) provides movie search, discovery, and details data via `fetch()` calls in `src/pages/Home.jsx` and `src/pages/MovieDetails.jsx`.
- Appwrite stores trending/search-count metadata in `src/appwrite.js`; the `matrics` collection tracks `searchTerm`, `count`, `movie_id`, and `poster_url` and powers the "Trending Movies" list.

## Build, test, and lint commands

Use the repository commands from the project root:

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Production build: `npm run build`
- Lint the codebase: `npm run lint`
- Preview production build: `npm run preview`

There is no automated test runner configured in `package.json` and no test files in the repository right now, so there is currently no repository-supported single-test command to run. If a test runner is introduced later, prefer executing the targeted file rather than the full suite.

## Architecture and code organization

The project is intentionally small and mostly feature-slice based, rather than layered by domain:

- `src/pages/` holds route-level screens and the main fetch logic for list/detail viewing.
- `src/components/` contains reusable UI pieces such as `Search`, `Spinner`, and `MovieCard`.
- `src/Constants/index.js` stores centralized display metadata (`DetailsTable`) used by the movie details page.
- `src/appwrite.js` is the app's data-access layer for Appwrite and is the canonical place for trending/search-count write/read operations.

The Home page is the main orchestration point:

- It reads `searchParams` from the URL and initializes local state from them.
- It calls the TMDB search/discover endpoints with a mapped sort option.
- It updates the URL when query/page/sort changes.
- It triggers `updateSearchCount()` for initial searches so Appwrite counts can drive the trending section.

The Movie Details page is similarly page-focused: it reads `id` from the route params, fetches a single movie with credits and videos, and renders metadata from a shared table config plus optional trailer links.

## Conventions specific to this repository

- Use `import.meta.env` for environment variables. The app expects `VITE_TMDB_API_KEY`, `VITE_APPWRITE_DATABASE_ID`, `VITE_APPWRITE_PROJECT_ID`, and `VITE_APPWRITE_ENDPOINT`.
- Avoid hardcoding TMDB or Appwrite configuration values in components; keep those values in env setup and the Appwrite client initializer.
- Search results are intentionally synced to the URL (`query`, `page`, `sort`) to preserve navigation state; follow that pattern if you add more filters.
- When rendering images from TMDB, use the standard `https://image.tmdb.org/t/p/...` patterns and keep the local fallback assets (`No-Poster.png`, `No-Photo.png`) as the default for missing media.
- `src/Constants/index.js` is the shared home for movie detail labels and formatting; extend that table instead of duplicating repeated detail rows in the page.
- The app is a client-side React app with no backend server; it relies on browser-side API calls plus Appwrite for the trending count feature.
- The repository uses Vite defaults and ES modules (`"type": "module"`), so imports and config should follow that pattern.
