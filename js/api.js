/**
 * Netflix-like App API Client
 * This module handles all interactions with the TMDb API and provides
 * methods to fetch content with all required information.
 * 
 * Features:
 * - Hero section with title logo, description and complete content details
 * - Your Next Watch: Randomized recommendations
 * - New Movies and Shows
 * - Top 10 Shows
 * - Today's Pick
 * - Responsive images (16:9 for desktop, 9:16 for mobile/tablet)
 * - Caching system to minimize API calls
 */

// TMDb API configuration
const API_CONFIG = {
  API_KEY: 'e4b90327227c88daac14c0bd0c1f93cd',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  BEARER_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNGI5MDMyNzIyN2M4OGRhYWMxNGMwYmQwYzFmOTNjZCIsIm5iZiI6MTc1ODY0ODMyMS43NDg5OTk4LCJzdWIiOiI2OGQyZDgwMTJhNWU3YzBhNDVjZWNmZWUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aylEitwtAH0w4XRk8izJNNkF_bet8sxiC9iI-zSdHbU',
  DEFAULT_LANGUAGE: 'fr-FR',
  IMAGE_SIZES: {
    poster: {
      small: 'w185',
      medium: 'w342', 
      large: 'w500',
      original: 'original'
    },
    backdrop: {
      small: 'w300',
      medium: 'w780',
      large: 'w1280',
      original: 'original'
    },
    logo: {
      small: 'w45',
      medium: 'w185',
      large: 'w500',
      original: 'original'
    }
  }
};

// Simple in-memory cache system
const cache = {
  data: {},
  
  // Set an item in the cache with a TTL (time-to-live)
  set: function(key, value, ttl = 3600000) { // default TTL: 1 hour
    this.data[key] = {
      value,
      expiry: Date.now() + ttl
    };
    console.log(`[Cache] Stored data for key: ${key}`);
  },
  
  // Get an item from the cache, returns null if expired or not found
  get: function(key) {
    const item = this.data[key];
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      console.log(`[Cache] Expired for key: ${key}`);
      delete this.data[key];
      return null;
    }
    
    console.log(`[Cache] Hit for key: ${key}`);
    return item.value;
  },
  
  // Clear the entire cache or a specific item
  clear: function(key) {
    if (key) {
      delete this.data[key];
      console.log(`[Cache] Cleared key: ${key}`);
    } else {
      this.data = {};
      console.log('[Cache] Cleared all data');
    }
  }
};

/**
 * Detects if the user is on a mobile/tablet device
 * @returns {boolean} - True if mobile/tablet, false if desktop
 */
function isMobileOrTablet() {
  // Check if matchMedia is supported
  if (window.matchMedia) {
    // Use matchMedia for responsive detection - max-width 768px is common breakpoint for tablets
    return window.matchMedia('(max-width: 768px)').matches;
  }
  
  // Fallback to user agent detection if matchMedia is not available
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
}

/**
 * Makes an HTTP request to the TMDb API with cache support
 * @param {string} endpoint - API endpoint (e.g., '/movie/popular')
 * @param {Object} params - Additional query parameters
 * @param {number} cacheTtl - Cache time-to-live in milliseconds (default: 1 hour)
 * @returns {Promise<Object>} - JSON response from the API
 */
async function fetchFromTMDb(endpoint, params = {}, cacheTtl = 3600000) {
  // Create a cache key from endpoint and params
  const queryParams = new URLSearchParams({
    language: API_CONFIG.DEFAULT_LANGUAGE,
    ...params
  }).toString();
  const cacheKey = `${endpoint}?${queryParams}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Build the full URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}?api_key=${API_CONFIG.API_KEY}&${queryParams}`;
    
    // Make the request with authorization header
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, data, cacheTtl);
    
    return data;
  } catch (error) {
    console.error(`Error fetching data from TMDb: ${error.message}`);
    throw error;
  }
}

/**
 * Get the appropriate image URL based on device type and image type
 * @param {string} path - Image path from TMDb
 * @param {string} type - Type of image ('poster', 'backdrop', 'logo')
 * @param {string} size - Size category ('small', 'medium', 'large', 'original')
 * @returns {string|null} - Complete image URL or null if path is invalid
 */
function getImageUrl(path, type = 'poster', size = 'large') {
  if (!path) return null;
  
  const sizeCategory = API_CONFIG.IMAGE_SIZES[type]?.[size] || 'original';
  return `${API_CONFIG.IMAGE_BASE_URL}/${sizeCategory}${path}`;
}

/**
 * Gets the title logo (Netflix-style graphic) for a movie or TV show
 * @param {number} id - Content ID
 * @param {string} contentType - 'movie' or 'tv'
 * @returns {Promise<string|null>} - URL to title logo or null if not found
 */
async function getTitleLogo(id, contentType) {
  try {
    // Fetch the details including images
    const details = await fetchFromTMDb(`/${contentType}/${id}`, {
      append_to_response: 'images',
      include_image_language: 'en,null'  // Include English and language-neutral logos
    });
    
    // Check if logos are available
    if (details.images && details.images.logos && details.images.logos.length > 0) {
      // Prefer English logos
      const englishLogo = details.images.logos.find(logo => logo.iso_639_1 === 'en');
      // Fall back to any logo if English not available
      const anyLogo = details.images.logos[0];
      const logo = englishLogo || anyLogo;
      
      return getImageUrl(logo.file_path, 'logo', 'large');
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch title logo for ${contentType} ${id}:`, error);
    return null;
  }
}

/**
 * Enhances content item with additional details needed for the UI
 * @param {Object} item - Basic content item from TMDb API
 * @param {string} contentType - 'movie' or 'tv'
 * @returns {Promise<Object>} - Enhanced content item with all needed details
 */
async function enhanceContentItem(item, contentType) {
  try {
    // Get the proper title field based on content type
    const title = contentType === 'movie' ? item.title : item.name;
    const originalTitle = contentType === 'movie' ? item.original_title : item.original_name;
    const releaseDate = contentType === 'movie' ? item.release_date : item.first_air_date;
    
    // Get title logo
    const titleLogo = await getTitleLogo(item.id, contentType);
    
    // Get appropriate poster URLs for desktop and mobile
    const desktopImage = getImageUrl(item.backdrop_path, 'backdrop', 'large');
    const mobileImage = getImageUrl(item.poster_path, 'poster', 'large');
    
    // Get full details including credits and videos
    const details = await fetchFromTMDb(`/${contentType}/${item.id}`, {
      append_to_response: 'credits,videos'
    });
    
    // Extract genres
    const genres = details.genres || [];
    
    // Extract trailer if available
    let trailer = null;
    if (details.videos && details.videos.results && details.videos.results.length > 0) {
      // Find the first trailer, preferably in the default language
      const videos = details.videos.results;
      const defaultLanguageTrailer = videos.find(
        video => video.type === 'Trailer' && video.iso_639_1 === API_CONFIG.DEFAULT_LANGUAGE.split('-')[0]
      );
      const anyTrailer = videos.find(video => video.type === 'Trailer');
      const videoToUse = defaultLanguageTrailer || anyTrailer || videos[0];
      
      trailer = {
        key: videoToUse.key,
        site: videoToUse.site, // Usually "YouTube"
        name: videoToUse.name,
        type: videoToUse.type
      };
    }
    
    // Extract cast (first 5 actors)
    const cast = details.credits?.cast?.slice(0, 5).map(actor => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      profile_path: actor.profile_path ? getImageUrl(actor.profile_path, 'poster', 'small') : null
    })) || [];
    
    // Extract directors/creators
    let creators = [];
    if (contentType === 'movie') {
      // For movies, find directors
      creators = details.credits?.crew
        ?.filter(person => person.job === 'Director')
        .map(director => ({
          id: director.id,
          name: director.name,
          job: director.job
        })) || [];
    } else {
      // For TV shows, use created_by
      creators = details.created_by?.map(creator => ({
        id: creator.id,
        name: creator.name,
        job: 'Creator'
      })) || [];
    }
    
    // Additional details specific to content type
    const contentTypeSpecifics = contentType === 'movie' 
      ? {
          runtime: details.runtime, // Movie runtime in minutes
          budget: details.budget,
          revenue: details.revenue
        } 
      : {
          number_of_seasons: details.number_of_seasons,
          number_of_episodes: details.number_of_episodes,
          status: details.status, // e.g., "Returning Series", "Ended", etc.
          next_episode_to_air: details.next_episode_to_air
        };
    
    // Return the enhanced content item
    return {
      id: item.id,
      type: contentType,
      title,
      original_title: originalTitle,
      overview: item.overview,
      images: {
        desktop: desktopImage, // 16:9 for desktop
        mobile: mobileImage,   // 9:16 for mobile/tablet
        poster_path: item.poster_path ? getImageUrl(item.poster_path, 'poster', 'medium') : null,
        backdrop_path: item.backdrop_path ? getImageUrl(item.backdrop_path, 'backdrop', 'large') : null
      },
      title_logo: titleLogo,
      has_title_logo: !!titleLogo,
      release_date: releaseDate,
      vote_average: item.vote_average,
      popularity: item.popularity,
      genres,
      trailer,
      cast,
      creators,
      adult: item.adult,
      ...contentTypeSpecifics
    };
  } catch (error) {
    console.error(`Error enhancing content item ${item.id}:`, error);
    // Return basic content if enhancement fails
    return {
      id: item.id,
      type: contentType,
      title: contentType === 'movie' ? item.title : item.name,
      overview: item.overview,
      images: {
        desktop: item.backdrop_path ? getImageUrl(item.backdrop_path, 'backdrop', 'large') : null,
        mobile: item.poster_path ? getImageUrl(item.poster_path, 'poster', 'large') : null
      },
      title_logo: null,
      has_title_logo: false,
      release_date: contentType === 'movie' ? item.release_date : item.first_air_date,
      vote_average: item.vote_average
    };
  }
}

/**
 * Process a batch of content items with enhanced details
 * @param {Array} items - Basic content items from TMDb API
 * @param {string} contentType - 'movie' or 'tv'
 * @param {number} batchSize - Number of items to process in parallel
 * @returns {Promise<Array>} - Enhanced content items
 */
async function processContentBatch(items, contentType, batchSize = 3) {
  const results = [];
  
  // Process in batches to avoid too many simultaneous requests
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(item => enhanceContentItem(item, contentType));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Gets content for the hero section (featured content)
 * @returns {Promise<Object>} - Enhanced content item for hero section
 */
async function getHeroContent() {
  try {
    // Get trending content for the hero (movies and TV combined)
    const response = await fetchFromTMDb('/trending/all/day');
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No trending results found');
    }
    
    // Select a high-quality item from top 5 trending items
    // Prioritize items with both backdrop and poster images
    const topItems = response.results.slice(0, 5);
    const completeItems = topItems.filter(item => item.backdrop_path && item.poster_path);
    
    // Use complete items if available, otherwise use any top item
    const selectedItem = completeItems.length > 0 
      ? completeItems[Math.floor(Math.random() * completeItems.length)]
      : topItems[Math.floor(Math.random() * topItems.length)];
    
    const contentType = selectedItem.media_type; // 'movie' or 'tv'
    
    // Enhance the selected item with all needed details
    const heroContent = await enhanceContentItem(selectedItem, contentType);
    
    return heroContent;
  } catch (error) {
    console.error('Failed to fetch hero content:', error);
    throw error;
  }
}

/**
 * Gets personalized 'Your Next Watch' recommendations
 * @param {number} count - Number of items to return
 * @returns {Promise<Array>} - Array of enhanced content items for recommendations
 */
async function getNextWatchRecommendations(count = 6) {
  try {
    // In a real app, this would be based on user viewing history
    // For demonstration, we'll get a mix of trending movies and TV shows
    
    // Get trending movies and TV shows
    const trendingMovies = await fetchFromTMDb('/trending/movie/week');
    const trendingTV = await fetchFromTMDb('/trending/tv/week');
    
    if (!trendingMovies.results || !trendingTV.results) {
      throw new Error('No trending results found');
    }
    
    // Combine movies and TV shows, taking half of each (if possible)
    const moviesHalf = Math.ceil(count / 2);
    const tvHalf = count - moviesHalf;
    
    const selectedMovies = trendingMovies.results.slice(0, moviesHalf);
    const selectedTV = trendingTV.results.slice(0, tvHalf);
    
    // Process movies with enhanced details
    const enhancedMovies = await processContentBatch(selectedMovies, 'movie');
    
    // Process TV shows with enhanced details
    const enhancedTV = await processContentBatch(selectedTV, 'tv');
    
    // Combine and shuffle to create a random mix
    const combined = [...enhancedMovies, ...enhancedTV];
    
    // Simple shuffle algorithm
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    
    return combined;
  } catch (error) {
    console.error('Failed to fetch next watch recommendations:', error);
    throw error;
  }
}

/**
 * Gets new movies released within the given time period
 * @param {number} days - Number of days to look back for "new" content
 * @param {number} count - Maximum number of items to return
 * @returns {Promise<Array>} - Array of enhanced movie items
 */
async function getNewMovies(days = 60, count = 12) {
  try {
    // Calculate date range
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    
    const fromDate = pastDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const toDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Get movies released within the date range, sorted by release date (newest first)
    const response = await fetchFromTMDb('/discover/movie', { 
      'primary_release_date.gte': fromDate,
      'primary_release_date.lte': toDate,
      'sort_by': 'primary_release_date.desc',
      'vote_count.gte': 20, // Only include movies with reasonable number of votes
      'page': 1
    });
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No new movies found');
    }
    
    // Get limited number of results
    const selectedMovies = response.results.slice(0, count);
    
    // Process with enhanced details
    return await processContentBatch(selectedMovies, 'movie');
  } catch (error) {
    console.error('Failed to fetch new movies:', error);
    throw error;
  }
}

/**
 * Gets new TV series released within the given time period
 * @param {number} days - Number of days to look back for "new" content
 * @param {number} count - Maximum number of items to return
 * @returns {Promise<Array>} - Array of enhanced TV series items
 */
async function getNewSeries(days = 60, count = 12) {
  try {
    // Calculate date range
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    
    const fromDate = pastDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const toDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Get series with new episodes within the date range
    const response = await fetchFromTMDb('/discover/tv', { 
      'air_date.gte': fromDate,
      'air_date.lte': toDate,
      'sort_by': 'first_air_date.desc',
      'vote_count.gte': 20, // Only include series with reasonable number of votes
      'page': 1
    });
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No new series found');
    }
    
    // Get limited number of results
    const selectedSeries = response.results.slice(0, count);
    
    // Process with enhanced details
    return await processContentBatch(selectedSeries, 'tv');
  } catch (error) {
    console.error('Failed to fetch new series:', error);
    throw error;
  }
}

/**
 * Gets top 10 TV shows by popularity
 * @returns {Promise<Array>} - Array of enhanced TV show items with ranking
 */
async function getTop10Shows() {
  try {
    // Get popular TV shows
    const response = await fetchFromTMDb('/tv/popular', { page: '1' });
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No TV shows found');
    }
    
    // Get top 10 results
    const top10 = response.results.slice(0, 10);
    
    // Process with enhanced details
    const enhancedShows = await processContentBatch(top10, 'tv');
    
    // Add rank property (1-10)
    return enhancedShows.map((show, index) => ({
      ...show,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Failed to fetch top 10 shows:', error);
    throw error;
  }
}

/**
 * Gets a random "Today's Pick" content item
 * @returns {Promise<Object>} - Enhanced content item for today's pick
 */
async function getTodaysPick() {
  try {
    // Use a stable "random" selection based on the date
    // This ensures the pick stays the same throughout the day
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const cacheKey = `todays_pick_${today}`;
    
    // Check if we already have today's pick cached
    const cachedPick = cache.get(cacheKey);
    if (cachedPick) {
      return cachedPick;
    }
    
    // Randomly choose between movie or TV show
    const contentType = Math.random() > 0.5 ? 'movie' : 'tv';
    
    // Get popular content of the chosen type
    const endpoint = `/${contentType}/popular`;
    const response = await fetchFromTMDb(endpoint, { page: '1' });
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No results found');
    }
    
    // Pick a random item from the results
    // Use a deterministic "random" selection based on the day of month
    const dayOfMonth = new Date().getDate();
    const index = dayOfMonth % response.results.length;
    const selectedItem = response.results[index];
    
    // Enhance with complete details
    const todaysPick = await enhanceContentItem(selectedItem, contentType);
    
    // Cache today's pick with a TTL of 24 hours
    cache.set(cacheKey, todaysPick, 24 * 3600000);
    
    return todaysPick;
  } catch (error) {
    console.error('Failed to fetch today\'s pick:', error);
    throw error;
  }
}

/**
 * Gets detailed information for a specific content item
 * @param {number} id - Content ID
 * @param {string} contentType - 'movie' or 'tv'
 * @returns {Promise<Object>} - Enhanced content item with complete details
 */
async function getContentDetails(id, contentType) {
  try {
    // Get basic details for the content
    const response = await fetchFromTMDb(`/${contentType}/${id}`);
    
    // Enhance with complete details
    return await enhanceContentItem(response, contentType);
  } catch (error) {
    console.error(`Failed to fetch details for ${contentType} ${id}:`, error);
    throw error;
  }
}

/**
 * Gets episodes for a specific TV series season
 * @param {number} seriesId - TV series ID
 * @param {number} seasonNumber - Season number
 * @returns {Promise<Object>} - Season details with episodes
 */
async function getTVSeasonEpisodes(seriesId, seasonNumber) {
  try {
    const response = await fetchFromTMDb(`/tv/${seriesId}/season/${seasonNumber}`);
    
    // Process episode images to ensure we have proper URLs
    if (response.episodes && response.episodes.length > 0) {
      response.episodes = response.episodes.map(episode => ({
        ...episode,
        still_path: episode.still_path ? getImageUrl(episode.still_path, 'backdrop', 'medium') : null
      }));
    }
    
    return response;
  } catch (error) {
    console.error(`Failed to fetch episodes for series ${seriesId} season ${seasonNumber}:`, error);
    throw error;
  }
}

/**
 * Searches for content by title
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise<Object>} - Search results with movies and TV shows
 */
async function searchContent(query, page = 1) {
  try {
    // Search for both movies and TV shows
    const movieResults = await fetchFromTMDb('/search/movie', {
      query,
      page: page.toString()
    });
    
    const tvResults = await fetchFromTMDb('/search/tv', {
      query,
      page: page.toString()
    });
    
    // Process first 5 movies and 5 TV shows with enhanced details
    const enhancedMovies = await processContentBatch(
      movieResults.results?.slice(0, 5) || [], 
      'movie'
    );
    
    const enhancedTV = await processContentBatch(
      tvResults.results?.slice(0, 5) || [], 
      'tv'
    );
    
    // Combine results
    return {
      movies: {
        results: enhancedMovies,
        total_results: movieResults.total_results || 0,
        total_pages: movieResults.total_pages || 0,
        page: movieResults.page || 1
      },
      tv: {
        results: enhancedTV,
        total_results: tvResults.total_results || 0,
        total_pages: tvResults.total_pages || 0,
        page: tvResults.page || 1
      }
    };
  } catch (error) {
    console.error(`Failed to search for "${query}":`, error);
    throw error;
  }
}

// Public API
const NetflixAPI = {
  // Main content sections
  getHeroContent,
  getNextWatchRecommendations,
  getNewMovies,
  getNewSeries,
  getTop10Shows,
  getTodaysPick,
  
  // Detailed content
  getContentDetails,
  getTVSeasonEpisodes,
  
  // Search
  searchContent,
  
  // Utilities
  getImageUrl,
  isMobileOrTablet,
  
  // Cache management
  clearCache: cache.clear.bind(cache)
};

// Export the API
export default NetflixAPI;