import { API_CONFIG, cache, CACHE_TTL } from '../api/config.js';

// Fonction pour vérifier si l'utilisateur est sur mobile/tablette
export function isMobileOrTablet() {
  return window.innerWidth < 1024;
}

// Fonction pour construire une URL d'image
export function getImageUrl(path, type, size = 'original') {
  if (!path) return null;
  
  const sizes = {
    poster: ['w342', 'w500', 'w780', 'original'],
    backdrop: ['w780', 'w1280', 'original'],
    logo: ['w300', 'original']
  };
  
  const selectedSize = sizes[type]?.includes(size) ? size : sizes[type][0];
  const directUrl = `${API_CONFIG.IMAGE_BASE_URL}/${selectedSize}${path}`;
  
  // En développement local, utiliser un proxy CORS
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocalDev) {
    // Solution la plus simple qui fonctionne bien
    return `https://wsrv.nl/?url=${encodeURIComponent(directUrl)}&output=webp`;
  }
  
  return directUrl;
}

// Fonction pour effectuer une requête à l'API
export async function fetchApi(endpoint, params = {}) {
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
  
  // Vérifier si la réponse est en cache et n'est pas expirée
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }
  
  // Construire l'URL de la requête
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_CONFIG.API_KEY);
  url.searchParams.append('language', API_CONFIG.LANGUAGE);
  
  // Ajouter les paramètres supplémentaires
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.append(key, value);
  });
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    
    // Mettre en cache la réponse
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Fonction utilitaire pour extraire le logo d'un contenu
export function extractTitleLogo(item) {
  if (!item.images?.logos?.length) return null;
  
  // Priorité aux logos en français ou anglais
  const preferredLogos = item.images.logos.filter(logo => 
    logo.iso_639_1 === 'fr' || logo.iso_639_1 === 'en' || logo.iso_639_1 === null
  );
  
  if (preferredLogos.length > 0) {
    // Trier par taille pour avoir le meilleur logo
    const sortedLogos = preferredLogos.sort((a, b) => b.width - a.width);
    return getImageUrl(sortedLogos[0].file_path, 'logo');
  } else if (item.images.logos.length > 0) {
    // Si pas de logo en français/anglais, prendre le premier disponible
    return getImageUrl(item.images.logos[0].file_path, 'logo');
  }
  
  return null;
}

// Fonction pour formater un film ou une série avec les bonnes images selon le contexte
export function formatContent(item, includeDetails = false) {
  const isMovie = item.title !== undefined;
  const type = isMovie ? 'movie' : 'tv';
  
  // Format de base pour les listes
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
  
  // Ajouter le logo du titre si disponible, même pour les listes standard
  if (item.images?.logos?.length > 0) {
    content.title_logo = extractTitleLogo(item);
    content.has_title_logo = !!content.title_logo;
  }
  if (item.images?.logos?.length > 0) {
  content.title_logo = extractTitleLogo(item);
}
  // Ajouter les détails supplémentaires si demandé
  if (includeDetails && item.genres) {
    // Si pas déjà ajouté plus haut
    if (!content.title_logo) {
      content.title_logo = extractTitleLogo(item);
      content.has_title_logo = !!content.title_logo;
    }
    
    content.runtime = isMovie ? item.runtime : item.episode_run_time?.[0];
    content.genres = item.genres.map(g => g.name);
    content.video_key = item.videos?.results?.[0]?.key;
    content.adult = item.adult;
    
    // Champs spécifiques aux séries
    if (!isMovie) {
      content.seasons = item.number_of_seasons;
      content.episodes = item.number_of_episodes;
    }
  }
  
  return content;
}