import { cache, CACHE_TTL } from './config.js';
import { fetchApi, formatContent, getImageUrl } from './utils.js';

// Fonction pour récupérer les détails d'un contenu spécifique (film ou série)
export async function getContentDetails(id, type) {
  const cacheKey = `details_${type}_${id}`;
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  }
  
  try {
    // Récupérer les détails complets du contenu
    const details = await fetchApi(`/${type}/${id}`, {
      append_to_response: 'images,videos,credits,similar,recommendations',
      include_image_language: 'en,null'
    });
    
    // Formater avec tous les détails
    const formattedDetails = formatContent(details, true);
    
    // Ajouter des informations supplémentaires
    if (details.credits) {
      formattedDetails.cast = details.credits.cast?.slice(0, 10).map(person => ({
        id: person.id,
        name: person.name,
        character: person.character,
        profile_path: getImageUrl(person.profile_path, 'poster', 'w185')
      }));
      
      formattedDetails.crew = details.credits.crew?.filter(
        person => ['Director', 'Producer', 'Writer'].includes(person.job)
      ).slice(0, 5).map(person => ({
        id: person.id,
        name: person.name,
        job: person.job,
        profile_path: getImageUrl(person.profile_path, 'poster', 'w185')
      }));
    }
    
    // Ajouter les saisons pour les séries
    if (type === 'tv' && details.seasons) {
      formattedDetails.seasons = details.seasons.map(season => ({
        id: season.id,
        name: season.name,
        season_number: season.season_number,
        episode_count: season.episode_count,
        poster_path: getImageUrl(season.poster_path, 'poster', 'w342')
      }));
    }
    
    // Ajouter les recommandations
    if (details.recommendations?.results) {
      formattedDetails.recommendations = details.recommendations.results
        .slice(0, 10)
        .map(item => formatContent(item));
    }
    
    cache.set(cacheKey, { data: formattedDetails, timestamp: Date.now() });
    return formattedDetails;
  } catch (error) {
    console.error(`Failed to fetch ${type} details for ID ${id}:`, error);
    throw error;
  }
}

// Fonction pour récupérer les épisodes d'une saison (pour les séries)
export async function getSeasonEpisodes(seriesId, seasonNumber) {
  const cacheKey = `episodes_${seriesId}_${seasonNumber}`;
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  }
  
  try {
    const seasonDetails = await fetchApi(`/tv/${seriesId}/season/${seasonNumber}`);
    
    const episodes = seasonDetails.episodes.map(episode => ({
      id: episode.id,
      name: episode.name,
      episode_number: episode.episode_number,
      overview: episode.overview,
      still_path: getImageUrl(episode.still_path, 'backdrop', 'w300'),
      air_date: episode.air_date,
      runtime: episode.runtime
    }));
    
    cache.set(cacheKey, { data: episodes, timestamp: Date.now() });
    return episodes;
  } catch (error) {
    console.error(`Failed to fetch episodes for series ${seriesId}, season ${seasonNumber}:`, error);
    throw error;
  }
}