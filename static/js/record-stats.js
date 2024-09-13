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
            displayRecentAdditions(albumData);  // Display the most recent additions
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
    let totalAlbums = 0;
    const uniqueArtists = new Set();

    albumData.forEach(album => {
        totalAlbums++;

        // Process artist info if not 'Various'
        if (album.artist && album.artist.toLowerCase() !== 'various') {
            uniqueArtists.add(album.artist);
            artistCounts[album.artist] = (artistCounts[album.artist] || 0) + 1;
        }

        // Process album year with validation
        if (album.date && !isNaN(new Date(album.date))) {
            const year = new Date(album.date).getFullYear();
            if (year > 1900 && year <= new Date().getFullYear()) {  // Validate year range
                yearCounts[year] = (yearCounts[year] || 0) + 1;

                // Calculate decade
                const decade = Math.floor(year / 10) * 10;
                decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
            }
        }
    });

    // Get top 5 artists by number of albums
    const topArtists = Object.entries(artistCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Get year data, filtering out years with zero albums
    const yearData = Object.entries(yearCounts)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .filter(data => data.count > 0)
        .sort((a, b) => a.year - b.year);

    // Get decade data, filtering out decades with zero albums
    const decadeData = Object.entries(decadeCounts)
        .map(([decade, count]) => ({ decade: parseInt(decade), count }))
        .sort((a, b) => a.decade - b.decade);

    // Calculate most albums in a year and most prolific artist
    const mostAlbumsYear = Object.keys(yearCounts).reduce((a, b) => yearCounts[a] > yearCounts[b] ? a : b);
    const mostProlificArtist = topArtists[0];

    return {
        totalAlbums,
        uniqueArtists: uniqueArtists.size,
        topArtists,
        yearData,
        decadeData,
        mostAlbumsYear,
        mostProlificArtist
    };
}

function displayStats(stats) {
    document.getElementById('total-albums').textContent = stats.totalAlbums;
    document.getElementById('unique-artists').textContent = stats.uniqueArtists;
    // Remove these lines:
    // document.getElementById('most-albums-year').textContent = `${stats.mostAlbumsYear} (${stats.yearData.find(y => y.year == stats.mostAlbumsYear).count} albums)`;
    // document.getElementById('most-prolific-artist').textContent = `${stats.mostProlificArtist[0]} (${stats.mostProlificArtist[1]} albums)`;
}

function createTopArtistsChart(topArtists) {
    const ctx = document.getElementById('top-artists-chart').getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: topArtists.map(artist => artist[0]),
            datasets: [{
                data: topArtists.map(artist => artist[1]),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, i) => ({
                                text: label,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                index: i
                            }));
                        },
                        usePointStyle: true,
                        pointStyle: function(context) {
                            const label = context.text;
                            const artist = albumData.find(album => album.artist === label);
                            if (artist && artist.artistImage) {
                                const image = new Image();
                                image.src = artist.artistImage;
                                return image;
                            }
                            return null;
                        },
                        pointStyleWidth: 40,
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: false,
                    text: 'Top 5 Artists by Number of Albums'
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
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Albums'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false,
                    text: 'Albums added by Year'
                }
            }
        }
    });
}

function displayRecentAdditions(albumData) {
    const recentAlbums = albumData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  
    const recentAdditionsHtml = recentAlbums.map(album => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <img src="${album.coverImage}" class="card-img-top" alt="${album.title}">
                <div class="card-body">
                    <h5 class="card-title">${album.title}</h5>
                    <p class="card-text">${album.artist}</p>
                    <p class="card-text"><small class="text-muted">${new Date(album.date).toLocaleDateString()}</small></p>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('recent-additions').innerHTML = recentAdditionsHtml;
}