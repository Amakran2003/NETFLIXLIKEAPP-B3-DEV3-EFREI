import { cache, CACHE_TTL } from './config.js';
import { fetchApi, formatContent, extractTitleLogo } from '../utils/utils.js';

// TODAY'S PICKS : Récupérer les recommandations du jour
export async function getTodaysTopPicks() {
  const cacheKey = 'todays_picks';
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  }
  
  try {
    // Récupérer des films et séries populaires
    const [movies, series] = await Promise.all([
      fetchApi('/movie/popular'),
      fetchApi('/tv/popular')
    ]);
    
    // Filtrer pour ne garder que ceux qui ont des images valides
    const validMovies = movies.results
      .filter(item => item.backdrop_path && item.poster_path)
      .slice(0, 8);
      
    const validSeries = series.results
      .filter(item => item.backdrop_path && item.poster_path)
      .slice(0, 8);
    
    // Récupérer les détails complets pour les logos
    const detailedMovies = await Promise.all(
      validMovies.map(movie => 
        fetchApi(`/movie/${movie.id}`, { append_to_response: 'images', include_image_language: 'en,null' })
      )
    );
    
    const detailedSeries = await Promise.all(
      validSeries.map(show => 
        fetchApi(`/tv/${show.id}`, { append_to_response: 'images', include_image_language: 'en,null' })
      )
    );
    
    // Formater les résultats avec extraction des logos
    const movieResults = detailedMovies.map(item => {
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
    
    const seriesResults = detailedSeries.map(item => {
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
    
    // Combiner et mélanger
    const combined = [...movieResults, ...seriesResults];
    const shuffled = combined.sort(() => Math.random() - 0.5).slice(0, 12);
    
    // Mettre en cache
    cache.set(cacheKey, { data: shuffled, timestamp: Date.now() });
    
    return shuffled;
  } catch (error) {
    console.error('Failed to fetch today\'s top picks:', error);
    return [];
  }
}