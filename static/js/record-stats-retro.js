document.addEventListener('DOMContentLoaded', function() {
    // Get the current era for theming
    const currentEra = document.body.getAttribute('data-era') || '80s';
    
    // Define color schemes based on era
    const colorSchemes = {
        '80s': {
            primary: '#00ff41',
            secondary: '#ffff00',
            background: '#000000',
            grid: '#00ff41',
            text: '#00ff41',
            colors: ['#00ff41', '#ffff00', '#ff00ff', '#00ffff', '#ff0080']
        },
        '90s': {
            primary: '#0000ff',
            secondary: '#800080',
            background: '#ffffff',
            grid: '#808080',
            text: '#000000',
            colors: ['#0000ff', '#800080', '#008080', '#ff0000', '#008000']
        }
    };
    
    const colors = colorSchemes[currentEra];
    
    // Chart.js default settings for retro theme
    Chart.defaults.color = colors.text;
    Chart.defaults.borderColor = colors.grid;
    Chart.defaults.font.family = currentEra === '80s' ? 'JetBrains Mono, monospace' : 'MS Sans Serif, sans-serif';
    
    fetch('/index.json')
        .then(response => response.json())
        .then(data => {
            if (!data.documents || !Array.isArray(data.documents)) {
                throw new Error('Album data is not in the correct format');
            }
            const albumData = data.documents;
            const stats = calculateStats(albumData);
            displayStats(stats);
            createTopArtistsChart(stats.topArtists, colors);
            createGenresChart(stats.genreData, colors);
            createAlbumsByYearChart(stats.yearData, colors);
        })
        .catch(error => {
            console.error('Error loading album data:', error);
            document.querySelector('.stats-container').innerHTML = '<p class="loading">Error: Unable to load album data</p>';
        });
});

function calculateStats(albumData) {
    const artistCounts = {};
    const yearCounts = {};
    const genreCounts = {};
    const styleCounts = {};
    let totalAlbums = 0;
    const uniqueArtists = new Set();

    albumData.forEach(album => {
        totalAlbums++;

        // Process artist info if not 'Various'
        if (album.artist && album.artist.toLowerCase() !== 'various') {
            uniqueArtists.add(album.artist);
            artistCounts[album.artist] = (artistCounts[album.artist] || 0) + 1;
        }

        // Process genres
        if (album.genres) {
            album.genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        }

        // Process styles
        if (album.styles) {
            album.styles.forEach(style => {
                styleCounts[style] = (styleCounts[style] || 0) + 1;
            });
        }

        // Process album year with validation
        if (album.date && !isNaN(new Date(album.date))) {
            const year = new Date(album.date).getFullYear();
            if (year > 1900 && year <= new Date().getFullYear()) {
                yearCounts[year] = (yearCounts[year] || 0) + 1;
            }
        }
    });

    const topArtists = Object.entries(artistCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([artist, count]) => ({ artist, count }));

    const yearData = Object.entries(yearCounts)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => a.year - b.year);

    const genreData = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 genres

    const styleData = Object.entries(styleCounts)
        .map(([style, count]) => ({ style, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 styles

    return {
        totalAlbums,
        uniqueArtists: uniqueArtists.size,
        topArtists,
        yearData,
        genreData,
        styleData
    };
}

function displayStats(stats) {
    document.getElementById('total-albums').textContent = stats.totalAlbums.toLocaleString();
    document.getElementById('unique-artists').textContent = stats.uniqueArtists.toLocaleString();

    // Update top artists list
    const topArtistsList = document.getElementById('top-artists');
    if (topArtistsList) {
        const artistListHtml = stats.topArtists.map(artist => 
            `<li><span class="artist-name"><a href="/artist/${formatSlug(artist.artist)}">${artist.artist}</a></span>: <span class="count">${artist.count}</span></li>`
        ).join('');
        topArtistsList.innerHTML = artistListHtml;
    }
}

// Helper function to format slugs
function formatSlug(name) {
    return name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '');
}

function createTopArtistsChart(topArtists, colors) {
    const ctx = document.getElementById('top-artists-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topArtists.map(artist => artist.artist),
            datasets: [{
                label: 'Album Count',
                data: topArtists.map(artist => artist.count),
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colors.grid + '33',
                        drawBorder: true,
                        borderColor: colors.grid
                    },
                    ticks: {
                        color: colors.text,
                        stepSize: 5
                    }
                },
                x: {
                    grid: {
                        color: colors.grid + '33',
                        drawBorder: true,
                        borderColor: colors.grid
                    },
                    ticks: {
                        color: colors.text
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createGenresChart(genreData, colors) {
    const ctx = document.getElementById('genre-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: genreData.map(data => data.genre),
            datasets: [{
                data: genreData.map(data => data.count),
                backgroundColor: colors.colors,
                borderColor: colors.grid,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: colors.text,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function createAlbumsByYearChart(yearData, colors) {
    const ctx = document.getElementById('albums-by-year-chart');
    if (!ctx) return;
    
    // Group by year ranges for cleaner display
    const recentYears = yearData.filter(d => d.year >= 2015);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: recentYears.map(data => data.year),
            datasets: [{
                label: 'Albums Added',
                data: recentYears.map(data => data.count),
                borderColor: colors.primary,
                backgroundColor: colors.primary + '33',
                tension: 0.1,
                pointBackgroundColor: colors.primary,
                pointBorderColor: colors.grid,
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colors.grid + '33',
                        drawBorder: true,
                        borderColor: colors.grid
                    },
                    ticks: {
                        color: colors.text
                    }
                },
                x: {
                    grid: {
                        color: colors.grid + '33',
                        drawBorder: true,
                        borderColor: colors.grid
                    },
                    ticks: {
                        color: colors.text
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: colors.text
                    }
                }
            }
        }
    });
}