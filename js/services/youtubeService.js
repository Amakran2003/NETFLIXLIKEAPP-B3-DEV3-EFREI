class YouTubeService {
    constructor() {
        // Utiliser directement la clé API depuis votre .env
        this.apiKey = 'AIzaSyA332K32BqVJZWT36gtL4GuHlbzNAtbs_o';
        this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    }

    // Rechercher des vidéos YouTube
    async searchVideos(query, maxResults = 5) {
        try {
            const url = `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=${maxResults}&type=video`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`YouTube API Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Erreur lors de la recherche YouTube:', error);
            return [];
        }
    }

    // Obtenir les détails d'une vidéo
    async getVideoDetails(videoId) {
        try {
            const url = `${this.baseUrl}/videos?part=snippet,statistics&id=${videoId}&key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`YouTube API Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.items[0] || null;
        } catch (error) {
            console.error('Erreur lors de la récupération des détails YouTube:', error);
            return null;
        }
    }

    // Rechercher un trailer pour un film/série
    async findTrailer(title, year = null) {
        const searchQuery = year ? `${title} ${year} trailer` : `${title} trailer`;
        const videos = await this.searchVideos(searchQuery, 3);
        
        // Filtrer pour trouver les trailers officiels
        const trailerKeywords = ['trailer', 'official', 'teaser', 'bande annonce'];
        const officialTrailer = videos.find(video => {
            const snippet = video.snippet;
            const titleLower = snippet.title.toLowerCase();
            const channelLower = snippet.channelTitle.toLowerCase();
            
            return trailerKeywords.some(keyword => titleLower.includes(keyword)) ||
                   channelLower.includes('official') ||
                   channelLower.includes(title.toLowerCase().split(' ')[0]);
        });
        
        return officialTrailer || videos[0] || null;
    }
}

export default new YouTubeService();