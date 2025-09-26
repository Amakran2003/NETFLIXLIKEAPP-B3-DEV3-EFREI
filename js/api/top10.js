import { cache, CACHE_TTL } from './config.js';
import { fetchApi, formatContent } from '../utils/utils.js';

// TOP 10 SHOWS : 10 séries populaires
export async function getTop10Shows() {
  const cacheKey = 'top10_shows';
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  }
  
  try {
    // Récupérer les séries les plus populaires
    const topSeries = await fetchApi('/tv/popular', { page: 1 });
    
    // Prendre les 10 premières séries et ajouter un rang
    const top10 = topSeries.results.slice(0, 10).map((item, index) => ({
      ...formatContent(item),
      rank: index + 1
    }));
    
    cache.set(cacheKey, { data: top10, timestamp: Date.now() });
    return top10;
  } catch (error) {
    console.error('Failed to fetch top 10 shows:', error);
    throw error;
  }
}