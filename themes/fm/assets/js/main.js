const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const LASTFM_WORKER_URL = 'https://russ.rest/ticker/'; // Update this
const USERNAME = 'russmckendrick'; // Update this

function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

let currentIndex = -1; // Start at -1 to show intro first
let tracks = [];

function updateDisplay() {
  const container = document.querySelector('.track-container');
  if (!tracks.length && currentIndex !== -1) return;
  
  // Remove existing exiting track
  const exitingTrack = container.querySelector('.exit');
  if (exitingTrack) {
    exitingTrack.remove();
  }
  
  // Move current track to exiting
  const currentTrack = container.querySelector('.active');
  if (currentTrack) {
    currentTrack.classList.remove('active');
    currentTrack.classList.add('exit');
  }
  
  // Create new track element
  const element = document.createElement('div');
  
  if (currentIndex === -1) {
    // Show intro message
    element.className = 'track-item';
    element.innerHTML = '🎧 Recently Scrobbled ...';
    currentIndex = 0;
  } else {
    // Show track info
    const track = tracks[currentIndex];
    const timeAgo = track.nowPlaying ? 'NOW PLAYING' : formatTimestamp(track.timestamp);
    element.className = `track-item${track.nowPlaying ? ' now-playing' : ''}`;
    // Always include the play symbol
    element.innerHTML = `▶ ${track.name} - ${track.artist} (${timeAgo})`;
    currentIndex = (currentIndex + 1) % (tracks.length + 1); // +1 to account for intro message
  }
  
  // Add and activate new track
  container.appendChild(element);
  setTimeout(() => {
    element.classList.add('active');
  }, 50);
}

async function fetchTracks() {
  try {
    const response = await fetch(`${LASTFM_WORKER_URL}?username=${USERNAME}`);
    if (!response.ok) throw new Error('Failed to fetch tracks');
    
    const data = await response.json();
    tracks = data.tracks;
    
    // Reset index if we have new tracks (but keep showing current item)
    if (currentIndex >= tracks.length) {
      currentIndex = -1;
    }
  } catch (error) {
    console.error('Error fetching tracks:', error);
  }
}

// Initialize
async function initialize() {
  await fetchTracks();
  updateDisplay();
  
  // Update display every 5 seconds
  setInterval(updateDisplay, 5000);
  
  // Fetch new tracks every minute
  setInterval(fetchTracks, 60000);
}

// Start everything
initialize();