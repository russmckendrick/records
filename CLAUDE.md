# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hugo-based static site generator project for russFM, a personal record collection showcase. The site displays music collection data scraped from Discogs via a separate Python scraper project.

## Technology Stack

- **Static Site Generator**: Hugo
- **Theme**: **"retro"** (located in `themes/retro/`) - Retro terminal/desktop theme with 80s/90s era switching
- **Frontend**: Custom CSS with retro aesthetics and era-specific styling
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
- `config/_default/` - Hugo configuration files (config.toml, params.toml, menus/, etc.)
- `content/albums/` - Album content (thousands of album directories)
- `content/artist/` - Artist pages
- `content/genres/` - Genre taxonomy pages
- `content/styles/` - Style taxonomy pages
- `themes/retro/` - Retro terminal/desktop theme with 80s/90s era switching
- `static/` - Static assets (favicons, images, JS)
- `public/` - Generated site output (git ignored)

### Theme Architecture

#### "retro" Theme
The retro theme provides a comprehensive terminal/desktop computer aesthetic:

**Core Features:**
- **Era Switching**: Toggle between 80s terminal and 90s desktop modes via header icon
- **Terminal Mode (80s)**: Green text on black background with scanlines and terminal aesthetics
- **Desktop Mode (90s)**: Windows 95-style UI with raised/inset borders and classic color scheme
- **Database Interface**: Music collection displayed as terminal database or desktop application
- **8-bit Effects**: Album artwork with pixelated filters and retro processing
- **SVG Icon System**: Professional terminal and desktop icons for era switching
- **Retro Typography**: JetBrains Mono for terminal mode, MS Sans Serif for desktop mode
- **Responsive Design**: Maintains retro aesthetics across all screen sizes

**Navigation & Layout:**
- **Hugo Menu Integration**: Uses Hugo's menu system for navigation (`config/_default/menus/`)
- **Dual View Modes**: List and card views for albums with toggle controls
- **Search & Filtering**: Real-time search with filtering capabilities on taxonomy pages
- **Responsive Grid**: Database-style table layouts that adapt to screen size
- **Breadcrumb Navigation**: Context-aware breadcrumbs for easy navigation

**Content Display:**
- **Album Detail Pages**: Comprehensive album information with metadata boxes, tracklisting, and image galleries
- **Artist Detail Pages**: Artist profiles with album listings in list/card view modes
- **Taxonomy Pages**: Genre and style pages with filtering, sorting, and pagination
- **Image Galleries**: Database-style table layout for release images with lazy loading
- **Conditional Content**: Smart display logic that only shows sections when content exists

### Content Structure
Albums follow this pattern:
```
content/albums/album-name-discogs-id/
├── index.md          # Album metadata
└── album-cover.jpg   # Cover image
```

Artists follow this pattern:
```
content/artist/artist-name/
├── _index.md         # Artist metadata and bio
└── artist-image.jpg  # Artist photo
```

## Configuration

### Site Configuration
- Base URL: https://www.russ.fm/
- Theme: **"retro"** (terminal/desktop theme with era switching)
- Taxonomies: artists, genres, styles
- Permalinks: `/albums/:slug`

### Menu Configuration
Menus are configured in `config/_default/menus/main.yaml`:
- Home, Albums, Artists, Genres, Styles navigation
- External links to Discogs and other platforms

### Content Features
- Automatic sitemap generation
- RSS feeds
- JSON output for search
- Git-based last modified dates
- Emoji support enabled
- Conditional content display to prevent empty sections

## Development Notes

### Content Updates
Content is typically updated via the external Discogs scraper rather than manual editing. The scraper generates the markdown files and downloads cover images.

### Theme Customization
Theme modifications should be made in `themes/retro/` directory structure, following Hugo's theme conventions.

### Hugo Template Development

**Template Hierarchy & Organization:**
- Hugo follows a specific template lookup order: single.html → list.html → baseof.html
- Use `{{ define "main" }}` blocks to override content areas in base templates
- Artist pages with `_index.md` are treated as sections, not single pages
- Use conditional logic in templates to handle different content types on the same template

**Partial Creation & Reuse:**
- Create modular partials in `themes/retro/layouts/partials/` for reusable components
- Use `{{ partial "component-name.html" . }}` to include partials with current context
- Pass specific data to partials: `{{ partial "component.html" (dict "albums" .albums "viewMode" "list") }}`
- Shared partials enable consistent functionality across different page types
- Example: album view controls used on homepage, artist pages, and taxonomy pages

**Template Logic & Conditionals:**
- Use `{{ if ne .Title "Artist" }}` to differentiate between listing and detail pages
- Combine multiple conditions: `{{ if and .Content (gt (len $contentStr) 0) }}`
- Hugo template functions: `strings.Contains`, `len`, `plainify`, `where`, `sort_by`
- Variable assignment: `{{ $variable := .Params.something }}`
- Set boolean flags: `{{ $hasContent := false }}` then `{{ $hasContent = true }}`

**Content Processing:**
- Use `{{ .Content | plainify }}` to strip HTML tags for content detection
- String functions: `strings.Contains $content "<p>"` to detect HTML elements
- Length checking: `{{ gt (len $plainContent) 20 }}` for minimum content validation
- Conditional content display prevents empty sections from appearing

**Data Access Patterns:**
- Site-wide data: `{{ .Site.Menus.main }}` for navigation
- Page parameters: `{{ .Params.artist_name }}` for frontmatter data
- Taxonomy data: `{{ range .Site.Taxonomies.artists }}` for artist listings
- Related content: `{{ where .Site.Pages "Section" "artist" }}` for filtered pages
- URL generation: `{{ .RelPermalink }}` for relative URLs

**Common Hugo Patterns Discovered:**
- **Menu Integration**: Replace hardcoded navigation with `{{ range .Site.Menus.main }}`
- **Template Reuse**: Use conditional logic in single template to handle multiple page types
- **Partial Data Passing**: Create flexible partials that accept different data contexts
- **Content Detection**: Implement smart logic to detect meaningful content vs empty/generated content
- **Responsive Partials**: Design partials that work across different layout contexts (homepage, detail pages, etc.)
- **CSS Organization**: Use CSS custom properties for theme switching and responsive design
- **Asset Management**: Organize static assets (SVG icons, images) in theme-specific directories

### Retro Theme Implementation

**Era Switching System:**
- CSS custom properties for 80s/90s color schemes and fonts
- JavaScript era toggle functionality with localStorage persistence
- Scanline effects and terminal-style visual effects for 80s mode
- Authentic 90s raised/inset border styling for desktop mode
- Era-specific image rendering (pixelated vs smooth)

**Database Aesthetics:**
- Music collection styled as retro computer interface
- Table-based layouts with proper headers and sorting
- Terminal/desktop appropriate styling for different eras
- Hover effects and interactive elements matching each era

**Performance Optimizations:**
- Lazy loading for Discogs images with rate limiting (200ms delays)
- Responsive image galleries with mobile-optimized layouts
- Efficient conditional rendering to prevent unnecessary DOM elements

### Key Files - retro Theme

**Core Templates:**
- `themes/retro/layouts/_default/baseof.html` - Base template with era switching functionality
- `themes/retro/layouts/index.html` - Homepage with database interface and dual view modes
- `themes/retro/layouts/_default/single.html` - Album detail pages with responsive metadata and conditional content
- `themes/retro/layouts/artist/list.html` - Combined artist listing and detail page with conditional logic
- `themes/retro/layouts/_default/terms.html` - Taxonomy listing pages (genres/styles) with filtering
- `themes/retro/layouts/_default/taxonomy.html` - Individual taxonomy pages with album listings

**Partials & Components:**
- `themes/retro/layouts/partials/artist-detail.html` - Artist detail page layout with action buttons
- `themes/retro/layouts/partials/navigation.html` - Hugo menu-based navigation system
- `themes/retro/layouts/partials/album-view-controls.html` - List/card view toggle controls
- `themes/retro/layouts/partials/album-list-view.html` - Database-style album listings
- `themes/retro/layouts/partials/album-card-view.html` - Card-based album grid layout
- `themes/retro/layouts/partials/filter-controls.html` - Album cover filter controls (8-bit, CGA, original)
- `themes/retro/layouts/partials/album-actions.html` - Action buttons with SVG icons

**Shortcodes:**
- `themes/retro/layouts/shortcodes/imageGrid.html` - Release image gallery with lazy loading and modal viewer

**Assets:**
- `themes/retro/static/images/terminal.svg` - Terminal icon for 80s mode
- `themes/retro/static/images/desktop.svg` - Desktop icon for 90s mode
- `themes/retro/static/images/wikipedia.svg` - Wikipedia external link icon
- `themes/retro/assets/css/retro.css` - Complete retro styling with era variables

### Retro Theme Features

**Visual Design:**
- **Era Variables**: CSS custom properties for 80s/90s color schemes and fonts
- **Scanline Effects**: Terminal-style visual effects for 80s mode with CSS animations
- **Window Borders**: Authentic 90s raised/inset border styling using CSS border effects
- **8-bit Filters**: CSS filters for pixelated album artwork with multiple filter modes
- **SVG Icon Integration**: Professional icons with proper alignment and menu integration
- **Responsive Breakpoints**: 1200px, 1024px, 768px, 480px with era-appropriate styling

**Functionality:**
- **Dual View System**: Reusable partials for list/card views across all album listings
- **Lazy Loading**: Rate-limited image loading for Discogs API compliance
- **Modal Image Viewer**: Full-screen image viewing with keyboard navigation
- **Smart Content Detection**: Conditional display logic prevents empty content sections
- **Search & Filter**: Real-time filtering on taxonomy pages with URL state management
- **Responsive Metadata**: Grid-based metadata layout that adapts to screen size

**Navigation & UX:**
- **Hugo Menu System**: Dynamic navigation based on Hugo menu configuration
- **Breadcrumb Navigation**: Context-aware breadcrumbs throughout the site
- **Era Toggle**: Persistent era switching with visual feedback
- **Keyboard Shortcuts**: ESC to close modals, responsive touch interactions
- **Mobile Optimization**: Touch-friendly interface with appropriate hiding of desktop-only elements

# Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.