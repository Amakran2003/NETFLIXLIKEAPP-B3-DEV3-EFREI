import { cache, CACHE_TTL } from './config.js';
import { fetchApi, formatContent, extractTitleLogo } from '../utils/utils.js';

// NEXT WATCH : Récupérer les recommandations pour l'utilisateur
export async function getNextWatchRecommendations() {
  const cacheKey = 'next_watch';
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  }
  
  try {
    // Choisir aléatoirement entre différentes catégories pour plus de variété
    const categories = [
      { type: 'movie', endpoint: '/movie/now_playing' },
      { type: 'movie', endpoint: '/movie/top_rated' },
      { type: 'tv', endpoint: '/tv/on_the_air' },
      { type: 'tv', endpoint: '/tv/popular' }
    ];
    
    // Choisir aléatoirement 2 catégories différentes
    const shuffledCategories = categories.sort(() => Math.random() - 0.5);
    const selectedCategories = shuffledCategories.slice(0, 2);
    
    // Récupérer les recommandations des catégories choisies
    const responses = await Promise.all(
      selectedCategories.map(category => 
        fetchApi(category.endpoint, { page: Math.floor(Math.random() * 3) + 1 }) // Pages aléatoires entre 1-3
      )
    );
    
    // Extraire et mélanger les résultats
    let mixedResults = [];
    responses.forEach((response, index) => {
      const validItems = response.results
        .filter(item => item.backdrop_path && item.poster_path)
        .slice(0, 6); // Limiter à 6 par catégorie
      
      mixedResults = [...mixedResults, ...validItems.map(item => ({
        ...item, 
        _type: selectedCategories[index].type
      }))];
    });
    
    // Mélanger pour plus de variété
    mixedResults = mixedResults.sort(() => Math.random() - 0.5);
    
    // Récupérer les détails complets pour les images et logos
    const detailedItems = await Promise.all(
      mixedResults.map(item => {
        const type = item._type || (item.title ? 'movie' : 'tv');
        return fetchApi(`/${type}/${item.id}`, { append_to_response: 'images', include_image_language: 'en,null' });
      })
    );
    
    // Formater le contenu avec les logos
    const results = detailedItems.map(item => {
      const formatted = formatContent(item);
      
      // S'assurer que le logo du titre est extrait
      if (item.images?.logos?.length > 0) {
        formatted.title_logo = extractTitleLogo(item);
        console.log(`Logo extrait pour ${formatted.title}: ${formatted.title_logo}`);
      } else {
        console.log(`Pas de logo disponible pour ${formatted.title}`);
      }
      
      return formatted;
    });
    
    // Mettre en cache
    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    
    return results;
  } catch (error) {
    console.error('Failed to fetch next watch content:', error);
    return [];
  }
}