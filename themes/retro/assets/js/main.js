const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const LASTFM_WORKER_URL = 'https://russ.rest/ticker/'; // Update this
const USERNAME = 'russmckendrick'; // Update this

// Local storage keys
const STORAGE_KEY = 'lastfm_ticker_state';
const LAST_UPDATE_KEY = 'lastfm_last_update';

function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

class TickerState {
  constructor() {
    this.tracks = [];
    this.currentIndex = -1;
    this.lastUpdate = 0;
    this.loadState();
    this.clearStateIfStale();
  }

  clearStateIfStale() {
    const stateAge = Date.now() - this.lastUpdate;
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    if (stateAge > thirtyMinutes) {
      this.tracks = [];
      this.currentIndex = -1;
      this.lastUpdate = 0;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_UPDATE_KEY);
      console.log('Cleared stale ticker state (older than 30 minutes)');
    }
  }

  loadState() {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      const lastUpdate = parseInt(localStorage.getItem(LAST_UPDATE_KEY) || '0');
      
      if (savedState) {
        const state = JSON.parse(savedState);
        this.tracks = state.tracks || [];
        this.currentIndex = state.currentIndex || -1;
        this.lastUpdate = lastUpdate;
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }

  saveState() {
    try {
      const state = {
        tracks: this.tracks,
        currentIndex: this.currentIndex
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  needsUpdate() {
    return Date.now() - this.lastUpdate > 60000; // 1 minute
  }

  async updateIfNeeded() {
    if (this.needsUpdate()) {
      await this.fetchTracks();
    }
  }

  async fetchTracks() {
    try {
      const response = await fetch(`${LASTFM_WORKER_URL}?username=${USERNAME}`);
      if (!response.ok) throw new Error('Failed to fetch tracks');
      
      const data = await response.json();
      this.tracks = data.tracks;
      this.saveState();
      
      // Reset index if we've gone past the end
      if (this.currentIndex >= this.tracks.length) {
        this.currentIndex = -1;
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  }

  getCurrentItem() {
    if (this.currentIndex === -1) {
      return {
        type: 'intro',
        content: '▶ Recently played...'
      };
    }

    const track = this.tracks[this.currentIndex];
    const timeAgo = track.nowPlaying ? 'NOW PLAYING' : formatTimestamp(track.timestamp);
    return {
      type: 'track',
      content: `▶ ${track.name} - ${track.artist} (${timeAgo})`,
      nowPlaying: track.nowPlaying
    };
  }

  advance() {
    if (!this.tracks.length && this.currentIndex !== -1) return;
    this.currentIndex = (this.currentIndex + 1) % (this.tracks.length + 1);
    this.saveState();
  }
}

const tickerState = new TickerState();

function updateDisplay() {
  const container = document.querySelector('.track-container');
  
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
  
  // Get current item from state
  const item = tickerState.getCurrentItem();
  
  // Create new track element
  const element = document.createElement('div');
  element.className = `track-item${item.nowPlaying ? ' now-playing' : ''}`;
  element.innerHTML = item.content;
  
  // Add and activate new track
  container.appendChild(element);
  setTimeout(() => {
    element.classList.add('active');
  }, 50);
  
  // Advance state
  tickerState.advance();
}

async function initialize() {
  // Update tracks if needed
  await tickerState.updateIfNeeded();
  
  // Initial display update
  updateDisplay();
  
  // Update display every 5 seconds
  setInterval(updateDisplay, 5000);
  
  // Check for updates every minute
  setInterval(() => tickerState.updateIfNeeded(), 60000);
  
  // Handle visibility changes
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      tickerState.updateIfNeeded();
    }
  });
}

// Start everything
initialize();