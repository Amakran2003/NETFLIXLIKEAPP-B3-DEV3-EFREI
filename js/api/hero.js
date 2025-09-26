import { cache, CACHE_TTL } from './config.js';
import { fetchApi, formatContent } from '../utils/utils.js';

// Fonction pour obtenir le contenu Hero (vedette)
export async function getHeroContent() {
  const cacheKey = 'hero_content';
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  }
  
  try {
    // Choisir aléatoirement entre film et série
    const contentType = Math.random() > 0.5 ? 'movie' : 'tv';
    
    // Obtenir un contenu populaire aléatoire
    const popular = await fetchApi(`/${contentType}/popular`, { page: 1 });
    const randomIndex = Math.floor(Math.random() * Math.min(5, popular.results.length));
    const content = popular.results[randomIndex];
    
    // Obtenir les détails complets avec images et vidéos
    const contentDetails = await fetchApi(`/${contentType}/${content.id}`, {
      append_to_response: 'images,videos',
      include_image_language: 'en,null'
    });
    
    // Formater le contenu avec tous les détails
    const heroContent = formatContent(contentDetails, true);
    
    cache.set(cacheKey, { data: heroContent, timestamp: Date.now() });
    return heroContent;
  } catch (error) {
    console.error('Failed to fetch hero content:', error);
    throw error;
  }
}