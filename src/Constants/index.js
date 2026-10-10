const formatCurrency = (amount) => amount ? `$${(amount / 1_000_000).toFixed(1)} million` : 'N/A';

export const DetailsTable = [
    {
        label: 'Overview',
        value: (movie) => movie.overview || 'N/A'
    },
    {
        label: 'Release Date',
        value: (movie) => movie.release_date || 'N/A'
    },
    {
        label: 'Countries',
        value: (movie) => movie.production_countries?.map(c => c.name).join(', ') || 'N/A'
    },
    {
        label: 'Status',
        value: (movie) => movie.status || 'N/A'
    },
    {
        label: 'Language',
        value: (movie) => movie.spoken_languages?.map(l => l.english_name).join(', ') || 'N/A' 
    },
    {
        label: 'Budget',
        value: (movie) => formatCurrency(movie.budget)
    },
    {
        label: 'Revenue',
        value: (movie) => formatCurrency(movie.revenue)
    },
    {
        label: 'Production Companies',
        value: (movie) => movie.production_companies?.map(p => p.name).join(', ') || 'N/A'
    }
]