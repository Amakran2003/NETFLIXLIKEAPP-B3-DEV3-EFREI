// Point d'entrée principal pour l'API

// Import des fonctionnalités de configuration
import { clearCache } from './config.js';

// Import des fonctions utilitaires
import { isMobileOrTablet, getImageUrl } from './utils.js';

// Import des fonctions spécifiques à chaque type de contenu
import { getHeroContent } from './hero.js';
import { getNextWatchRecommendations } from './nextWatch.js';
import { getNewContent } from './newContent.js';
import { getTop10Shows } from './top10.js';
import { getTodaysTopPicks } from './todaysPicks.js';
import { getContentDetails, getSeasonEpisodes } from './details.js';

// Exporter toutes les fonctions API
export default {
  // Fonctions de contenu
  getHeroContent,
  getNextWatchRecommendations,
  getNewContent,
  getTop10Shows,
  getTodaysTopPicks,
  getContentDetails,
  getSeasonEpisodes,
  
  // Fonctions utilitaires
  isMobileOrTablet,
  getImageUrl,
  clearCache
};