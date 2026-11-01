import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Spinner from './components/Spinner.jsx';

const MovieDetails = lazy(() => import('./pages/MovieDetails.jsx'));

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main>
            <div className="pattern" />
            <div className="wrapper">
              <Outlet />
            </div>
          </main>
        }
      >
        <Route index element={<Home />} />
        <Route
          path="movie/:id"
          element={
            <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><Spinner /></div>}>
              <MovieDetails />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;

