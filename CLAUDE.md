# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hugo-based static site generator project for russFM, a personal record collection showcase. The site displays music collection data scraped from Discogs via a separate Python scraper project.

## Technology Stack

- **Static Site Generator**: Hugo
- **Themes**: 
  - **"fm-v2"** (located in `themes/fm-v2/`) - Modern theme with dark mode support
  - **"retro"** (located in `themes/retro/`) - NEW retro terminal/desktop theme with 80s/90s era switching
- **Frontend**: Bootstrap CSS framework with SCSS customization (fm-v2) / Custom CSS with retro aesthetics (retro)
- **Content**: Markdown files with YAML frontmatter
- **Data Source**: Discogs API via external Python scraper

## Common Development Commands

### Hugo Operations
```bash
# Start development server with live reload
hugo server

# Start development server with drafts
hugo server -D

# Build site for production
hugo

# Build site with drafts
hugo -D
```

### Content Management
Content is organized in `content/albums/` with each album having its own directory containing:
- `index.md` - Album metadata and description
- Album cover image (JPG format)

## Project Structure

### Key Directories
- `config/_default/` - Hugo configuration files (config.toml, params.toml, etc.)
- `content/albums/` - Album content (thousands of album directories)
- `content/artist/` - Artist pages
- `themes/fm-v2/` - Modern custom Hugo theme with dark mode support
- `themes/retro/` - NEW retro terminal/desktop theme with 80s/90s era switching
- `static/` - Static assets (favicons, images, JS)
- `public/` - Generated site output (git ignored)

### Theme Architecture

#### Modern "fm-v2" Theme
The modern "fm-v2" theme includes:
- Bootstrap-based responsive design with modern aesthetics
- Dark/Light theme toggle with auto mode (follows system preference)
- Minimal black/white/gray color palette
- SCSS compilation pipeline with CSS custom properties
- Album carousel and grid layouts with hover animations
- Search functionality with enhanced UI
- Modern pagination with smooth transitions
- Metadata display for albums and artists
- Inter font family for improved typography
- Responsive design with mobile-first approach

#### NEW "retro" Theme
The retro theme provides a terminal/desktop computer aesthetic:
- **Era Switching**: Toggle between 80s terminal and 90s desktop modes
- **Terminal Mode (80s)**: Green text on black background with scanlines and terminal aesthetics
- **Desktop Mode (90s)**: Windows 95-style UI with raised/inset borders and classic color scheme
- **Database Interface**: Music collection displayed as terminal database or desktop application
- **8-bit Effects**: Album artwork with pixelated filters and retro processing
- **SVG Icon System**: Professional terminal and desktop icons for era switching
- **Retro Typography**: JetBrains Mono for terminal mode, MS Sans Serif for desktop mode
- **Responsive Design**: Maintains retro aesthetics across all screen sizes
- **Modern Functionality**: Dual view modes (list/cards), search, and responsive layout

### Content Structure
Albums follow this pattern:
```
content/albums/album-name-discogs-id/
├── index.md          # Album metadata
└── album-cover.jpg   # Cover image
```

## Configuration

### Site Configuration
- Base URL: https://www.russ.fm/
- Themes Available: 
  - **"fm-v2"** (modern custom theme with dark mode)
  - **"retro"** (terminal/desktop theme with era switching)
- Taxonomies: artists, genres, styles
- Permalinks: `/albums/:slug`

### Content Features
- Automatic sitemap generation
- RSS feeds
- JSON output for search
- Git-based last modified dates
- Emoji support enabled

## Development Notes

### Content Updates
Content is typically updated via the external Discogs scraper rather than manual editing. The scraper generates the markdown files and downloads cover images.

### Theme Customization
Theme modifications should be made in `themes/fm-v2/` directory structure, following Hugo's theme conventions.

### Asset Pipeline
SCSS files are processed through Hugo's asset pipeline. Main stylesheets are in `themes/fm-v2/assets/sass/`.

### Dark Mode Implementation
The fm-v2 theme includes a comprehensive dark mode system:
- CSS custom properties for theme variables
- JavaScript theme switcher with localStorage persistence
- Three modes: light, dark, auto (follows system preference)
- Theme toggle button in navbar with icon indicators
- Smooth transitions between themes

### Modern Enhancements
- Card hover animations with transform effects
- Modern button styles with enhanced interactions
- Improved typography with Inter font family
- Responsive navbar with glassmorphism effect
- Enhanced pagination with better mobile support
- Sticker image in jumbotron header for visual appeal

### Key Files - fm-v2 Theme
- `themes/fm-v2/assets/js/theme-switcher.js` - Dark mode functionality
- `themes/fm-v2/assets/js/modern-enhancements.js` - UI animations and interactions
- `themes/fm-v2/assets/sass/variable-overrides.scss` - Color system and typography
- `themes/fm-v2/assets/sass/styles.scss` - Component styling with theme support
- `themes/fm-v2/layouts/partials/header/theme-toggle.html` - Theme toggle component

### Key Files - retro Theme
- `themes/retro/layouts/_default/baseof.html` - Base template with era switching functionality
- `themes/retro/layouts/index.html` - Homepage with database interface and dual view modes
- `themes/retro/layouts/_default/single.html` - Album detail pages with 8-bit effects
- `themes/retro/layouts/artist/single.html` - Artist profile pages
- `themes/retro/layouts/artist/list.html` - Artist listing with search and filtering
- `themes/retro/static/images/terminal.svg` - Terminal icon for 80s mode
- `themes/retro/static/images/desktop.svg` - Desktop icon for 90s mode
- `themes/retro/assets/css/retro.css` - Complete retro styling with era variables

### Retro Theme Features
- **Era Variables**: CSS custom properties for 80s/90s color schemes and fonts
- **Scanline Effects**: Terminal-style visual effects for 80s mode
- **Window Borders**: Authentic 90s raised/inset border styling
- **8-bit Filters**: CSS filters for pixelated album artwork
- **SVG Icon Integration**: Professional icons with proper menu integration
- **Responsive Breakpoints**: 1200px, 1024px, 768px, 480px with era-appropriate styling
- **Database Aesthetics**: Music collection styled as retro computer interface