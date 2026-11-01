# Copilot instructions for Good Story

## Project overview

Good Story is a Vite + React movie discovery app. The app boots in `src/main.jsx` with `BrowserRouter`; `src/App.jsx` defines the route tree:

- `/` -> `src/pages/Home.jsx`
- `/movie/:id` -> lazy-loaded `src/pages/MovieDetails.jsx`

The shared app shell in `src/App.jsx` renders the page layout and routed content via `Outlet`. Most UI state is page-local and kept in React hooks, while the URL syncs critical filters such as search query, page number, and sort option.

The data flow is split between two external services:

- TMDB (The Movie Database) provides movie search, discovery, and details data via `fetch()` calls in `src/pages/Home.jsx` and `src/pages/MovieDetails.jsx`.
- Appwrite stores trending/search-count metadata in `src/appwrite.js`; the `matrics` collection tracks `searchTerm`, `count`, `movie_id`, and `poster_url` and powers the "Trending Movies" list.

## Build, test, and lint commands

Use the repository commands from the project root:

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Production build: `npm run build`
- Run the Vitest suite: `npm test`
- Lint the codebase: `npm run lint`
- Preview production build: `npm run preview`

Tests use Vitest, React Testing Library, and jsdom. The route and movie-feature tests are in `src/App.test.jsx`, with DOM setup in `src/test/setup.js`. Mock TMDB and Appwrite calls in tests rather than depending on external network services.

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
- It lazy-loads Appwrite operations for trending movies and search analytics so they do not increase the initial JavaScript bundle.

The Movie Details page is similarly page-focused: it reads `id` from the route params, fetches a single movie with credits and videos, and renders metadata from a shared table config plus optional trailer links. It is lazy-loaded by the route.

## Conventions specific to this repository

- Use `import.meta.env` for environment variables. The app expects `VITE_TMDB_API_KEY`, `VITE_APPWRITE_DATABASE_ID`, `VITE_APPWRITE_PROJECT_ID`, and `VITE_APPWRITE_ENDPOINT`.
- Avoid hardcoding TMDB or Appwrite configuration values in components; keep those values in env setup and the Appwrite client initializer.
- Search results are intentionally synced to the URL (`query`, `page`, `sort`) to preserve navigation state; follow that pattern if you add more filters.
- When rendering images from TMDB, use the standard `https://image.tmdb.org/t/p/...` patterns. Movie cards use `w342` posters and lazy loading; detail-page images use appropriately sized TMDB images. Use the existing local fallbacks (`src/assets/No-Poster.png`, `src/assets/No-Photo.jpg`) when media is missing.
- Keep static assets optimized and use the existing self-hosted fonts in `public/fonts/`; preload fonts and route-specific hero imagery only where they are needed.
- `src/Constants/index.js` is the shared home for movie detail labels and formatting; extend that table instead of duplicating repeated detail rows in the page.
- The app is a client-side React app with no backend server; it relies on browser-side API calls plus Appwrite for the trending count feature.
- The repository uses Vite defaults and ES modules (`"type": "module"`), so imports and config should follow that pattern.
- Don't change UI/UX design or layout without prior discussion; the app is intentionally minimal and focused on the movie discovery experience.