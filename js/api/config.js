// Configuration de l'API TMDb
export const API_CONFIG = {
  API_KEY: 'e4b90327227c88daac14c0bd0c1f93cd',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  LANGUAGE: 'en-US',
  REGION: 'US'
};

// Système de cache
export const cache = new Map();
export const CACHE_TTL = 60 * 60 * 1000; // 1 heure en millisecondes

// Fonction pour vider le cache
export function clearCache(key = null) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Configuration des variables d'environnement
const CONFIG = {
    YOUTUBE_API_KEY: 'AIzaSyA332K32BqVJZWT36gtL4GuHlbzNAtbs_o', // En développement
    YOUTUBE_API_BASE_URL: 'https://www.googleapis.com/youtube/v3'
};

// En production, vous pourriez charger depuis process.env
// if (typeof process !== 'undefined' && process.env) {
//     CONFIG.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || CONFIG.YOUTUBE_API_KEY;
// }

export default CONFIG;