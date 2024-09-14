document.addEventListener('DOMContentLoaded', function() {
    fetch('/index.json')
        .then(response => response.json())
        .then(data => {
            if (!data.documents || !Array.isArray(data.documents)) {
                throw new Error('Album data is not in the correct format');
            }
            const albumData = data.documents;
            const stats = calculateStats(albumData);
            displayStats(stats);
            createTopArtistsChart(stats.topArtists);
            createAlbumsByYearChart(stats.yearData);
            createGenresChart(stats.genreData);
            createStylesChart(stats.styleData);
            displayRecentAdditions(albumData);  
        })
        .catch(error => {
            console.error('Error loading album data:', error);
            document.getElementById('stats-container').innerHTML = '<p class="alert alert-danger">Error: Unable to load album data</p>';
        });
});

function calculateStats(albumData) {
    const artistCounts = {};
    const yearCounts = {};
    const decadeCounts = {};
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

                // Calculate decade
                const decade = Math.floor(year / 10) * 10;
                decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
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
    document.getElementById('total-albums').textContent = stats.totalAlbums;
    document.getElementById('unique-artists').textContent = stats.uniqueArtists;

    // Create top artists stats dynamically with links
    const artistStatsHtml = stats.topArtists.map(artist => `
        <li><a href="/artists/${formatSlug(artist.artist)}">${artist.artist}</a>: ${artist.count}</li>
    `).join('');
    document.getElementById('top-artists').innerHTML = artistStatsHtml;

    // Create genre and style stats dynamically with links
    const genreStatsHtml = stats.genreData.map(genre => `
        <li><a href="/genres/${formatSlug(genre.genre)}">${genre.genre}</a>: ${genre.count}</li>
    `).join('');
    document.getElementById('top-genres').innerHTML = genreStatsHtml;

    const styleStatsHtml = stats.styleData.map(style => `
        <li><a href="/styles/${formatSlug(style.style)}">${style.style}</a>: ${style.count}</li>
    `).join('');
    document.getElementById('top-styles').innerHTML = styleStatsHtml;
}

// Helper function to format slugs
function formatSlug(name) {
    return name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '');
}

function createTopArtistsChart(topArtists) {
    const ctx = document.getElementById('top-artists-chart').getContext('2d');

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: topArtists.map(artist => artist.artist),
            datasets: [{
                data: topArtists.map(artist => artist.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

function createAlbumsByYearChart(yearData) {
    const ctx = document.getElementById('albums-by-year-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: yearData.map(data => data.year),
            datasets: [{
                label: 'Number of Albums',
                data: yearData.map(data => data.count),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Albums' }
                },
                x: {
                    title: { display: true, text: 'Year' }
                }
            }
        }
    });
}

function createGenresChart(genreData) {
    const ctx = document.getElementById('top-genres-chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: genreData.map(data => data.genre),
            datasets: [{
                label: 'Genres',
                data: genreData.map(data => data.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: false,
                    text: 'Top 5 Genres'
                }
            }
        }
    });
}

function createStylesChart(styleData) {
    const ctx = document.getElementById('top-styles-chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: styleData.map(data => data.style),
            datasets: [{
                label: 'Styles',
                data: styleData.map(data => data.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: false,
                    text: 'Top 5 Styles'
                }
            }
        }
    });
}

function displayRecentAdditions(albumData) {
    const recentAlbums = albumData
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    const recentAdditionsHtml = recentAlbums.map(album => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <a href="${album.albumUri}"><img src="${album.coverImage}" class="card-img-top" alt="${album.album}"></a>
                <div class="card-body">
                    <h5 class="card-title"><a href="${album.albumUri}">${album.album}</a></h5> <!-- Use album.album instead of title -->
                    <p class="card-text"><a href="${album.artistUri}">${album.artist}</a></p> <!-- Ensure artist name is linked properly -->
                    <p class="card-text"><small class="text-muted">${new Date(album.date).toLocaleDateString()}</small></p>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('recent-additions').innerHTML = recentAdditionsHtml;
}
