import { API_CONFIG, cache, CACHE_TTL } from '../api/config.js';

// Fonction pour vérifier si l'utilisateur est sur mobile/tablette
export function isMobileOrTablet() {
  return window.innerWidth < 1024;
}


export function getImageUrl(path, type, size = 'original') {
  if (!path) return null;
  
  const sizes = {
    poster: ['w342', 'w500', 'w780', 'original'],
    backdrop: ['w780', 'w1280', 'original'],
    logo: ['w300', 'original']
  };
  
  const selectedSize = sizes[type]?.includes(size) ? size : sizes[type][0];
  const directUrl = `${API_CONFIG.IMAGE_BASE_URL}/${selectedSize}${path}`;
  

  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocalDev) {

    return `https://wsrv.nl/?url=${encodeURIComponent(directUrl)}&output=webp`;
  }
  
  return directUrl;
}


export async function fetchApi(endpoint, params = {}) {
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
  

  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }
  

  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_CONFIG.API_KEY);
  url.searchParams.append('language', API_CONFIG.LANGUAGE);
  

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.append(key, value);
  });
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    

    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}


export function extractTitleLogo(item) {
  if (!item.images?.logos?.length) return null;
  

  const preferredLogos = item.images.logos.filter(logo => 
    logo.iso_639_1 === 'fr' || logo.iso_639_1 === 'en' || logo.iso_639_1 === null
  );
  
  if (preferredLogos.length > 0) {

    const sortedLogos = preferredLogos.sort((a, b) => b.width - a.width);
    return getImageUrl(sortedLogos[0].file_path, 'logo');
  } else if (item.images.logos.length > 0) {

    return getImageUrl(item.images.logos[0].file_path, 'logo');
  }
  
  return null;
}

// Fonction pour formater un film ou une série avec les bonnes images selon le contexte
export function formatContent(item, includeDetails = false) {
  const isMovie = item.title !== undefined;
  const type = isMovie ? 'movie' : 'tv';
  

  const content = {
    id: item.id,
    title: isMovie ? item.title : item.name,
    overview: item.overview,
    images: {
      // Pour tous les contenus, récupérer les deux formats d'image
      desktop: getImageUrl(item.backdrop_path, 'backdrop', 'w1280'), // 16:9
      mobile: getImageUrl(item.poster_path, 'poster', 'w780'),       // 9:16
      // Image pour la page de détails (toujours 16:9)
      details: getImageUrl(item.backdrop_path, 'backdrop', 'w1280')
    },
    rating: item.vote_average?.toFixed(1),
    release_year: isMovie 
      ? (item.release_date ? new Date(item.release_date).getFullYear() : null)
      : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : null),
    type
  };
  

  if (item.images?.logos?.length > 0) {
    content.title_logo = extractTitleLogo(item);
    content.has_title_logo = !!content.title_logo;
  }
  if (item.images?.logos?.length > 0) {
  content.title_logo = extractTitleLogo(item);
}

  if (includeDetails && item.genres) {

    if (!content.title_logo) {
      content.title_logo = extractTitleLogo(item);
      content.has_title_logo = !!content.title_logo;
    }
    
    content.runtime = isMovie ? item.runtime : item.episode_run_time?.[0];
    content.genres = item.genres.map(g => g.name);
    content.video_key = item.videos?.results?.[0]?.key;
    content.adult = item.adult;
    

    if (!isMovie) {
      content.seasons = item.number_of_seasons;
      content.episodes = item.number_of_episodes;
    }
  }
  
  return content;
}
