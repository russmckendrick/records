// SQL Search System - Unified SQL search functionality for homepage
// Reuses the SQL query logic from the search page but displays results compactly

window.SQLSearch = window.SQLSearch || {
  searchIndex: null,
  initialized: false
};

// Initialize SQL search system
function initializeSQLSearch() {
  if (window.SQLSearch.initialized) {
    return Promise.resolve();
  }

  // Get the base URL from a meta tag or current location
  const baseUrl = document.querySelector('meta[name="base-url"]')?.content || 
                  window.location.origin;

  return fetch(baseUrl + '/index.json')
    .then(response => response.json())
    .then(data => {
      window.SQLSearch.searchIndex = data.documents;
      window.SQLSearch.initialized = true;
      console.log('SQL Search index loaded:', window.SQLSearch.searchIndex.length, 'records');
    })
    .catch(error => {
      console.error('Failed to initialize SQL search system:', error);
      throw error;
    });
}

// Register SQL search input
function registerSQLSearch(inputId, resultsId) {
  const searchInput = document.getElementById(inputId);
  const searchResults = document.getElementById(resultsId);
  
  if (!searchInput || !searchResults) {
    console.error('SQL Search elements not found:', inputId, resultsId);
    return;
  }

  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        executeSQLQuery(query, resultsId);
      }
    } else if (e.key === 'Escape') {
      clearSQLResults(resultsId);
      searchInput.blur();
    }
  });

  // Hide results when clicking outside
  document.addEventListener('click', function(event) {
    if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
      clearSQLResults(resultsId);
    }
  });
}

// Execute SQL query
function executeSQLQuery(query, resultsId) {
  if (!window.SQLSearch.searchIndex) {
    displaySQLError(resultsId, 'Database not loaded. Please wait...');
    return;
  }

  try {
    // Convert natural language to SQL if needed
    const convertedQuery = convertNaturalLanguageQuery(query);
    const actualQuery = convertedQuery.query;
    
    // Parse and execute query
    const result = parseAndExecuteQuery(actualQuery);
    
    if (result !== null) {
      displaySQLResults(result, resultsId, convertedQuery.converted ? query : null);
    }
  } catch (error) {
    displaySQLError(resultsId, 'Query Error: ' + error.message);
  }
}

// Parse and execute SQL query (reused from search page)
function parseAndExecuteQuery(query) {
  const normalizedQuery = query.trim().toUpperCase();
  
  // Handle special commands
  if (normalizedQuery === 'HELP') {
    return {
      type: 'help',
      content: 'SQL Help not available in compact mode. Visit /search for full help.',
      headers: null
    };
  }
  
  if (normalizedQuery === 'CLEAR') {
    return null; // Will be handled by caller
  }
  
  if (normalizedQuery === 'SHOW TABLES;' || normalizedQuery === 'SHOW TABLES') {
    return {
      type: 'info',
      content: [
        { name: 'albums', description: 'Music album records' },
        { name: 'artists', description: 'Artist information' }
      ],
      headers: ['Table', 'Description']
    };
  }

  // Parse SELECT queries
  const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?;?$/i);
  
  if (selectMatch) {
    const [, fields, table, whereClause, orderBy, limit] = selectMatch;
    
    if (table.toLowerCase() !== 'albums') {
      throw new Error('Only "albums" table is supported');
    }
    
    let results = [...window.SQLSearch.searchIndex];
    
    // Apply WHERE clause
    if (whereClause) {
      results = applyWhereClause(results, whereClause);
    }
    
    // Apply ORDER BY
    if (orderBy) {
      results = applyOrderBy(results, orderBy);
    }
    
    // Apply LIMIT
    if (limit) {
      results = results.slice(0, parseInt(limit));
    }
    
    // Select fields
    const selectedFields = fields.trim() === '*' ? null : 
        fields.split(',').map(f => f.trim().toLowerCase());
    
    // Handle COUNT
    if (fields.trim().toUpperCase() === 'COUNT(*)') {
      return {
        type: 'count',
        content: [{ count: results.length }],
        headers: ['COUNT(*)']
      };
    }
    
    return {
      type: 'select',
      content: results,
      headers: selectedFields,
      totalCount: results.length
    };
  }
  
  throw new Error('Invalid query syntax. Use SELECT * FROM albums WHERE ...');
}

// Apply WHERE clause (reused from search page)
function applyWhereClause(results, whereClause) {
  // Handle OR conditions (for natural language searches)
  if (whereClause.includes(' OR ')) {
    const orConditions = whereClause.split(/\s+OR\s+/i);
    return results.filter(record => {
      return orConditions.some(condition => {
        return evaluateCondition(record, condition.trim());
      });
    });
  }
  
  // Handle AND conditions
  const conditions = whereClause.split(/\s+AND\s+/i);
  
  return results.filter(record => {
    return conditions.every(condition => {
      return evaluateCondition(record, condition.trim());
    });
  });
}

// Evaluate condition (reused from search page)
function evaluateCondition(record, condition) {
  // Handle LIKE operator
  const likeMatch = condition.match(/(\w+)\s+LIKE\s+["']%([^%"']+)%["']/i);
  if (likeMatch) {
    const [, field, value] = likeMatch;
    const fieldValue = getFieldValue(record, field.toLowerCase());
    if (fieldValue === null || fieldValue === undefined) return false;
    return fieldValue.toString().toLowerCase().includes(value.toLowerCase());
  }
  
  // Handle regular operators
  const match = condition.match(/(\w+)\s*(=|>|<|>=|<=|!=)\s*["']?([^"']+)["']?/i);
  if (!match) return true;
  
  const [, field, operator, value] = match;
  const fieldValue = getFieldValue(record, field.toLowerCase());
  
  if (fieldValue === null || fieldValue === undefined) return false;
  
  switch (operator) {
    case '=':
      return fieldValue.toString().toLowerCase().includes(value.toLowerCase());
    case '!=':
      return !fieldValue.toString().toLowerCase().includes(value.toLowerCase());
    case '>':
      return parseInt(fieldValue) > parseInt(value);
    case '<':
      return parseInt(fieldValue) < parseInt(value);
    case '>=':
      return parseInt(fieldValue) >= parseInt(value);
    case '<=':
      return parseInt(fieldValue) <= parseInt(value);
    default:
      return true;
  }
}

// Apply ORDER BY (reused from search page)
function applyOrderBy(results, orderBy) {
  const [field, direction] = orderBy.trim().split(/\s+/);
  const isDesc = direction && direction.toUpperCase() === 'DESC';
  
  return results.sort((a, b) => {
    const aVal = getFieldValue(a, field.toLowerCase());
    const bVal = getFieldValue(b, field.toLowerCase());
    
    if (aVal < bVal) return isDesc ? 1 : -1;
    if (aVal > bVal) return isDesc ? -1 : 1;
    return 0;
  });
}

// Get field value (reused from search page)
function getFieldValue(record, field) {
  switch (field) {
    case 'artist':
      return record.artist || '';
    case 'album':
      return record.album || '';
    case 'title':
      return record.title || '';
    case 'year':
      const year = record.date ? new Date(record.date).getFullYear() : 0;
      return year;
    case 'genre':
      return Array.isArray(record.genres) ? record.genres.join(', ') : '';
    case 'style':
      return Array.isArray(record.styles) ? record.styles.join(', ') : '';
    case 'release_id':
      return record.discogsRelease || '';
    default:
      return record[field] || '';
  }
}

// Convert natural language to SQL (reused from search page)
function convertNaturalLanguageQuery(input) {
  const trimmedInput = input.trim();
  
  // Check if it's already SQL (starts with SQL keywords)
  const sqlKeywords = ['SELECT', 'SHOW', 'DESCRIBE', 'HELP', 'CLEAR'];
  const firstWord = trimmedInput.split(' ')[0].toUpperCase();
  
  if (sqlKeywords.includes(firstWord)) {
    return { query: trimmedInput, converted: false };
  }
  
  // Convert any natural language input to search both artists and albums
  const sqlQuery = `SELECT * FROM albums WHERE artist LIKE "%${trimmedInput}%" OR album LIKE "%${trimmedInput}%";`;
  return {
    query: sqlQuery,
    converted: true,
    convertedSql: sqlQuery
  };
}

// Display SQL results in table format (like search page)
function displaySQLResults(result, resultsId, originalQuery = null) {
  const searchResults = document.getElementById(resultsId);
  
  if (result.type === 'count') {
    const table = createResultTable(result);
    searchResults.innerHTML = '';
    searchResults.appendChild(table);
    searchResults.classList.add('active');
    showMainContent(false);
    return;
  }

  if (result.type === 'help' || result.type === 'info') {
    const table = createResultTable(result);
    searchResults.innerHTML = '';
    searchResults.appendChild(table);
    searchResults.classList.add('active');
    showMainContent(false);
    return;
  }

  if (result.content.length === 0) {
    const queryText = originalQuery || 'your query';
    searchResults.innerHTML = `
      <div class="search-no-results">
        No records found matching "${queryText}"<br>
        <small>Try searching for artist names, album titles, or use SQL syntax</small>
      </div>
    `;
    searchResults.classList.add('active');
    showMainContent(false);
    return;
  }
  
  // Display ALL results in table format (no limit)
  const table = createResultTable(result);
  const footer = `<div class="search-result-footer">${result.content.length} row(s) returned</div>`;
  
  searchResults.innerHTML = '';
  searchResults.appendChild(table);
  searchResults.innerHTML += footer;
  searchResults.classList.add('active');
  
  // Hide main content if there are results
  showMainContent(false);
}

// Display SQL error
function displaySQLError(resultsId, errorMessage) {
  const searchResults = document.getElementById(resultsId);
  searchResults.innerHTML = `
    <div class="search-no-results">
      <strong>Error:</strong> ${errorMessage}
    </div>
  `;
  searchResults.classList.add('active');
}

// Clear SQL results
function clearSQLResults(resultsId) {
  const searchResults = document.getElementById(resultsId);
  searchResults.classList.remove('active');
  searchResults.innerHTML = '';
  showMainContent(true);
}

// Show/hide main content (for homepage)
function showMainContent(show) {
  const systemStats = document.querySelector('.system-stats');
  const viewControls = document.querySelector('.view-controls');
  const dbSection = document.querySelector('.db-section');
  const pagination = document.querySelector('.pagination-section');
  
  const elements = [systemStats, viewControls, dbSection, pagination];
  elements.forEach(element => {
    if (element) {
      element.style.display = show ? '' : 'none';
    }
  });
}

// Create result table (reused from search page)
function createResultTable(result) {
  const table = document.createElement('table');
  table.className = 'results-table';
  
  // Headers
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  if (result.type === 'count') {
    const th = document.createElement('th');
    th.textContent = 'COUNT(*)';
    headerRow.appendChild(th);
  } else if (result.headers) {
    if (result.type === 'info') {
      result.headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });
    } else {
      result.headers.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field.toUpperCase();
        headerRow.appendChild(th);
      });
    }
  } else {
    // Default headers for SELECT *
    ['ARTIST', 'ALBUM', 'YEAR', 'GENRE', 'STYLE'].forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
  }
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Body
  const tbody = document.createElement('tbody');
  
  result.content.forEach(record => {
    const row = document.createElement('tr');
    
    if (result.type === 'count') {
      const td = document.createElement('td');
      td.textContent = record.count;
      row.appendChild(td);
    } else if (result.type === 'info') {
      Object.values(record).forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        row.appendChild(td);
      });
    } else {
      if (result.headers) {
        result.headers.forEach(field => {
          const td = document.createElement('td');
          const value = getFieldValue(record, field);
          
          // Create clickable links for artists and albums
          if (field === 'artist' && record.artistUri) {
            const link = document.createElement('a');
            link.href = record.artistUri;
            link.textContent = value;
            link.className = 'result-link';
            td.appendChild(link);
          } else if (field === 'album' && record.uri) {
            const link = document.createElement('a');
            link.href = record.uri;
            link.textContent = value;
            link.className = 'result-link';
            td.appendChild(link);
          } else {
            td.textContent = value;
          }
          
          row.appendChild(td);
        });
      } else {
        // Default fields for SELECT *
        const fields = ['artist', 'album', 'year', 'genre', 'style'];
        fields.forEach(field => {
          const td = document.createElement('td');
          const value = getFieldValue(record, field);
          
          // Create clickable links for artists and albums
          if (field === 'artist' && record.artistUri) {
            const link = document.createElement('a');
            link.href = record.artistUri;
            link.textContent = value;
            link.className = 'result-link';
            td.appendChild(link);
          } else if (field === 'album' && record.uri) {
            const link = document.createElement('a');
            link.href = record.uri;
            link.textContent = value;
            link.className = 'result-link';
            td.appendChild(link);
          } else {
            td.textContent = value;
          }
          
          row.appendChild(td);
        });
      }
    }
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  return table;
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeSQLSearch().then(() => {
    // Auto-register any SQL search inputs found on the page
    const sqlSearchInputs = document.querySelectorAll('.sql-search-input');
    sqlSearchInputs.forEach(input => {
      const inputId = input.id;
      const resultsId = input.getAttribute('data-results-id');
      if (inputId && resultsId) {
        registerSQLSearch(inputId, resultsId);
      }
    });
  }).catch(error => {
    console.error('Failed to initialize SQL search:', error);
  });
});