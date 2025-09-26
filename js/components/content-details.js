import API from '../api/index.js';

// Variables globales pour le modal vidéo
let videoModal;
let videoCloseBtn;

// Fonction pour extraire les paramètres de l'URL
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: urlParams.get('id'),
        type: urlParams.get('type')
    };
}

// Fonction pour initialiser le modal vidéo
function initVideoModal() {
    videoModal = document.getElementById('video-modal');
    videoCloseBtn = document.getElementById('video-close-btn');
    
    // Événement pour fermer le modal
    if (videoCloseBtn) {
        videoCloseBtn.addEventListener('click', closeVideoModal);
    }
    
    // Fermer le modal en cliquant à l'extérieur
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });
    }
    
    // Fermer le modal avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });
}

// Fonction pour obtenir l'ID YouTube du trailer
async function getYouTubeTrailerId(details) {
    // Vérifier s'il y a un trailer YouTube dans les données
    if (details.youtube_trailer_id) {
        return details.youtube_trailer_id;
    }
    
    if (details.trailer_url && details.trailer_url.includes('youtube.com/watch?v=')) {
        const urlParams = new URLSearchParams(details.trailer_url.split('?')[1]);
        return urlParams.get('v');
    }
    
    if (details.trailer_url && details.trailer_url.includes('youtu.be/')) {
        return details.trailer_url.split('youtu.be/')[1];
    }
    
    // Rechercher automatiquement un trailer sur YouTube
    try {
        const trailer = await YouTubeService.findTrailer(details.title, details.release_year);
        if (trailer) {
            console.log(`Trailer trouvé pour "${details.title}":`, trailer.snippet.title);
            return trailer.id.videoId;
        }
    } catch (error) {
        console.error('Erreur lors de la recherche de trailer:', error);
    }
    
    // Si pas de trailer trouvé, utiliser une vidéo par défaut
    return 'M7lc1UVf-VE'; // Ed Sheeran - Perfect (vidéo stable)
}

// Fonction pour ouvrir le modal vidéo avec YouTube
async function openVideoModal(details) {
    if (!videoModal) return;
    
    // Afficher un loader pendant la recherche
    const videoContainer = document.querySelector('.video-container');
    videoContainer.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 400px;
            color: white;
            font-size: 1.2rem;
        ">
            <i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>
            Recherche du trailer...
        </div>
    `;
    
    // Afficher le modal avec le loader
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const youtubeId = await getYouTubeTrailerId(details);
        
        // Remplacer le loader par la vidéo
        videoContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${youtubeId}?controls=1&rel=0&modestbranding=1" 
                frameborder="0" 
                allowfullscreen
                allow="encrypted-media">
            </iframe>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement de la vidéo:', error);
        showVideoError();
    }
}

// Fonction pour afficher une erreur vidéo
function showVideoError() {
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        videoContainer.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 400px;
                color: white;
                text-align: center;
                flex-direction: column;
                padding: 20px;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>Erreur de chargement</h3>
                <p style="opacity: 0.7;">Impossible de charger la vidéo pour le moment.</p>
            </div>
        `;
    }
}

// Fonction pour fermer le modal vidéo
function closeVideoModal() {
    if (!videoModal) return;
    
    // Supprimer l'iframe pour arrêter la vidéo
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        videoContainer.innerHTML = `
            <video id="video-player" controls>
                <source src="" type="video/mp4">
                <p>Votre navigateur ne supporte pas la lecture vidéo.</p>
            </video>
        `;
    }
    
    // Cacher le modal
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Fonction pour initialiser les boutons de lecture
function initPlayButtons(details) {
    const playButtons = document.querySelectorAll('.btn-primary');
    playButtons.forEach(button => {
        if (button.textContent.trim().includes('Lecture')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                openVideoModal(details);
            });
        }
    });
}

// Reste du code identique...
async function renderContentDetails() {
    const { id, type } = getUrlParams();
    
    if (!id || !type) {
        console.error('ID ou type manquant dans l\'URL');
        showError('Paramètres manquants');
        return;
    }
    
    try {
        console.log(`Chargement des détails pour ${type} ${id}...`);
        
        const details = await API.getContentDetails(id, type);
        console.log('Détails chargés:', details);
        
        document.title = `${details.title} - StreamFlix`;
        updateHeroSection(details);
        updateMainContent(details, type);
        updateMetadata(details);
        
        if (type === 'tv' && details.seasons) {
            showEpisodesSection(details);
        } else {
            hideEpisodesSection();
        }
        
        if (details.recommendations && details.recommendations.length > 0) {
            renderSuggestions(details.recommendations);
        }
        
        updateAboutSection(details);
        initPlayButtons(details);
        
    } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        showError('Impossible de charger le contenu');
    }
}

function updateHeroSection(details) {
    const heroBackdrop = document.querySelector('.hero-backdrop');
    if (heroBackdrop && details.images && details.images.details) {
        heroBackdrop.style.backgroundImage = `url(${details.images.details})`;
    }
}

function updateMainContent(details, type) {
    const contentType = document.getElementById('content-type');
    const contentTitle = document.getElementById('content-title');
    
    if (contentType) {
        contentType.textContent = type === 'movie' ? 'Movie' : 'Series'
    }
    
    if (contentTitle) {
        contentTitle.textContent = details.title;
    }
}

function updateMetadata(details) {
    const ratingValue = document.querySelector('.rating-value');
    if (ratingValue && details.rating) {
        ratingValue.textContent = `${details.rating}/10`;
    }
    
    const metadataYear = document.querySelector('.metadata-year');
    if (metadataYear && details.release_year) {
        metadataYear.textContent = details.release_year;
    }
    
    const metadataDuration = document.querySelector('.metadata-duration');
    if (metadataDuration && details.runtime) {
        const hours = Math.floor(details.runtime / 60);
        const minutes = details.runtime % 60;
        if (hours > 0) {
            metadataDuration.textContent = `${hours}h ${minutes}min`;
        } else {
            metadataDuration.textContent = `${minutes}min`;
        }
    }
    
    const metadataSeasons = document.querySelector('.metadata-seasons');
    if (metadataSeasons && details.seasons) {
        metadataSeasons.style.display = 'block';
        metadataSeasons.textContent = `${details.seasons} saison${details.seasons > 1 ? 's' : ''}`;
    }
    
    const synopsis = document.querySelector('.content-synopsis');
    if (synopsis && details.overview) {
        synopsis.textContent = details.overview;
    }
}

function showEpisodesSection(details) {
    const episodesSection = document.getElementById('episodes-section');
    if (episodesSection) {
        episodesSection.style.display = 'block';
    }
}

function hideEpisodesSection() {
    const episodesSection = document.getElementById('episodes-section');
    if (episodesSection) {
        episodesSection.style.display = 'none';
    }
}

function renderSuggestions(recommendations) {
    const suggestionsGrid = document.querySelector('.suggestions-grid');
    if (!suggestionsGrid) return;
    
    suggestionsGrid.innerHTML = '';
    
    recommendations.slice(0, 6).forEach(item => {
        const card = createSuggestionCard(item);
        suggestionsGrid.appendChild(card);
    });
}

function createSuggestionCard(item) {
    const card = document.createElement('article');
    card.className = 'suggestion-card';
    
    const imageUrl = item.images ? (item.images.desktop || item.images.mobile) : 'https://via.placeholder.com/300x169';
    
    card.innerHTML = `
        <div class="suggestion-thumbnail">
            <img src="${imageUrl}" alt="${item.title}">
        </div>
        <div class="suggestion-info">
            <h3 class="suggestion-title">${item.title}</h3>
            <div class="suggestion-meta">
                <span class="suggestion-badge">${item.type === 'movie' ? 'Movie' : 'Series'}</span>
                ${item.rating ? `<span class="suggestion-rating">${item.rating}/10</span>` : ''}
                ${item.release_year ? `<span class="suggestion-year">${item.release_year}</span>` : ''}
            </div>
            <p class="suggestion-synopsis">${item.overview || 'Description non disponible.'}</p>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `content-details.html?id=${item.id}&type=${item.type}`;
    });
    
    return card;
}

function updateAboutSection(details) {
    const aboutDetails = document.querySelector('.about-details');
    if (!aboutDetails) return;
    
    aboutDetails.innerHTML = '';
    
    if (details.crew) {
        const directors = details.crew.filter(person => person.job === 'Director');
        if (directors.length > 0) {
            const directorItem = createAboutItem('Directors :', directors.map(d => d.name).join(', '));
            aboutDetails.appendChild(directorItem);
        }
    }
    
    if (details.cast && details.cast.length > 0) {
        const actors = details.cast.slice(0, 4).map(actor => actor.name).join(', ');
        const castItem = createAboutItem('Main actors :', actors);
        aboutDetails.appendChild(castItem);
    }
    
    if (details.genres && details.genres.length > 0) {
        const genresItem = createAboutItem('Genres :', details.genres.join(', '));
        aboutDetails.appendChild(genresItem);
    }
    
    if (details.release_year) {
        const releaseItem = createAboutItem('Release date :', details.release_year.toString());
        aboutDetails.appendChild(releaseItem);
    }
}

function createAboutItem(label, value) {
    const item = document.createElement('div');
    item.className = 'about-item';
    
    const labelElement = document.createElement('span');
    labelElement.className = 'about-label';
    labelElement.textContent = label;
    
    const valueElement = document.createElement('span');
    valueElement.className = 'about-value';
    valueElement.textContent = value;
    
    item.appendChild(labelElement);
    item.appendChild(valueElement);
    
    return item;
}

function showError(message = 'Une erreur est survenue') {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 100px 20px; color: white;">
                <h1>Erreur de chargement</h1>
                <p>${message}</p>
                <a href="index.html" style="color: #e50914; text-decoration: none; font-size: 1.1rem;">← Retour à l'accueil</a>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initVideoModal();
    renderContentDetails();
});
