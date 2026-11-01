import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { getTrendingMovies, updateSearchCount } from './appwrite';

vi.mock('./appwrite', () => ({
  getTrendingMovies: vi.fn(),
  updateSearchCount: vi.fn(),
}));

const movies = [
  {
    id: 1,
    title: 'The Matrix',
    popularity: 80,
    vote_average: 8.7,
    poster_path: '/matrix.jpg',
    release_date: '1999-03-31',
    original_language: 'en',
  },
  {
    id: 2,
    title: 'A New Hope',
    popularity: 20,
    vote_average: 8.2,
    poster_path: null,
    release_date: '1977-05-25',
    original_language: 'en',
  },
];

const movieDetails = {
  id: 603,
  title: 'The Matrix',
  release_date: '1999-03-31',
  runtime: 136,
  vote_average: 8.7,
  vote_count: 20000,
  poster_path: '/matrix.jpg',
  backdrop_path: '/matrix-backdrop.jpg',
  tagline: 'Welcome to the Real World.',
  overview: 'A computer hacker learns the truth about his reality.',
  genres: [{ id: 1, name: 'Action' }],
  homepage: 'https://example.com/matrix',
  production_countries: [{ name: 'United States of America' }],
  spoken_languages: [{ english_name: 'English' }],
  status: 'Released',
  budget: 63000000,
  revenue: 463000000,
  production_companies: [{ name: 'Warner Bros.' }],
  videos: {
    results: [{ type: 'Trailer', site: 'YouTube', key: 'trailer123' }],
  },
};

const jsonResponse = (data, ok = true) => ({
  ok,
  json: async () => data,
});

const renderApp = (initialEntry = '/') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  );

describe('application routes and movie features', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    getTrendingMovies.mockResolvedValue([]);
    updateSearchCount.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('loads movie cards with optimized poster URLs and valid list semantics', async () => {
    fetch.mockResolvedValue(
      jsonResponse({ results: movies, total_pages: 2 }),
    );

    renderApp();

    const matrixLink = await screen.findByRole('link', { name: /The Matrix/ });
    expect(matrixLink).toHaveAttribute('href', '/movie/1');
    expect(within(matrixLink).getByRole('img', { name: 'The Matrix' })).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w342/matrix.jpg',
    );
    expect(within(matrixLink).getByRole('img', { name: 'The Matrix' })).toHaveAttribute(
      'loading',
      'lazy',
    );
    expect(screen.getByRole('list').querySelectorAll(':scope > li')).toHaveLength(2);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/discover/movie?sort_by=popularity.desc&page=1'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('searches, sorts results, updates search analytics, and paginates', async () => {
    fetch.mockImplementation(async (url) => {
      if (String(url).includes('/search/movie')) {
        return jsonResponse({
          results: movies,
          total_pages: 2,
        });
      }

      return jsonResponse({ results: movies, total_pages: 2 });
    });

    renderApp();

    await screen.findByRole('link', { name: /The Matrix/ });
    fireEvent.change(screen.getByPlaceholderText('Search for a movie...'), {
      target: { value: '  matrix  ' },
    });
    fireEvent.click(screen.getByAltText('search-icon'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/movie?query=matrix&page=1'),
        expect.any(Object),
      );
    });
    await waitFor(() => {
      expect(updateSearchCount).toHaveBeenCalledWith('matrix', movies[0]);
    });

    fireEvent.change(screen.getByLabelText('Sort by:'), {
      target: { value: 'title.asc' },
    });

    await waitFor(() => {
      const cardTitles = screen.getAllByRole('link', { name: /The Matrix|A New Hope/ });
      expect(cardTitles[0]).toHaveTextContent('A New Hope');
      expect(cardTitles[1]).toHaveTextContent('The Matrix');
    });

    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    await waitFor(() => {
      expect(
        screen.getByText(
          (_, element) =>
            element?.tagName === 'SPAN' &&
            element.textContent.replace(/\s+/g, ' ').trim() === 'Page 2 of 2',
        ),
      ).toBeInTheDocument();
      expect(fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/search/movie?query=matrix&page=2'),
        expect.any(Object),
      );
    });
  });

  it('shows a clear message when movie search fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockResolvedValue(jsonResponse({}, false));

    renderApp();

    expect(
      await screen.findByText('Failed to fetch movies. Please try again later.'),
    ).toBeInTheDocument();
  });

  it('loads movie details, formatted metadata, images, and trailer on a deep link', async () => {
    fetch.mockResolvedValue(jsonResponse(movieDetails));

    renderApp('/movie/603');

    expect(await screen.findByRole('heading', { name: 'The Matrix' })).toBeInTheDocument();
    expect(screen.getByText('1999 • 2h 16m')).toBeInTheDocument();
    expect(screen.getByText('A computer hacker learns the truth about his reality.')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Watch Trailer/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=trailer123',
    );
    expect(screen.getByAltText('The Matrix')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w500/matrix.jpg',
    );
    expect(screen.getByAltText('Backdrop')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w1280/matrix-backdrop.jpg',
    );
    expect(fetch).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/603?append_to_response=credits,videos&language=en-US',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('shows an error when movie details cannot be loaded', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockResolvedValue(jsonResponse({}, false));

    renderApp('/movie/603');

    expect(
      await screen.findByText('Could not load movie details. Please try again later.'),
    ).toBeInTheDocument();
  });
});
