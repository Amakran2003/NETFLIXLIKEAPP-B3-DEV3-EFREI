import API from '../api/index.js';

// Fonction pour charger et afficher la section "Today's Top Picks"
export async function renderTopPickSection() {
  try {
    console.log('Rendu de la section Today\'s Top Picks...');
    
    // Chercher la section existante par ID
    const topPickSection = document.querySelector('#top-pick-heading').closest('.movie-section');
    
    if (!topPickSection) {
      console.error('Section "Today\'s Top Pick for You" introuvable dans le DOM');
      return;
    }
    
    // Récupérer la grille de films
    const movieGrid = topPickSection.querySelector('.movie-grid');
    if (!movieGrid) {
      console.error('Grille de films introuvable dans la section "Today\'s Top Pick for You"');
      return;
    }
    
    // Ajouter une classe de chargement
    movieGrid.classList.add('loading');
    
    // Récupérer les données depuis l'API
    const topPicks = await API.getTodaysTopPicks();
    console.log('Données Top Picks chargées:', topPicks.length, 'éléments');
    
    // Vider le contenu actuel (placeholders)
    movieGrid.innerHTML = '';
    
    // Générer les cartes de films
    topPicks.forEach(item => {
      if (!item || (!item.images?.desktop && !item.images?.mobile)) {
        console.warn(`Item invalide ignoré dans Top Picks`);
        return;
      }
      
      // Créer la carte
      const card = document.createElement('article');
      card.className = 'movie-card';
      card.setAttribute('role', 'listitem');
      card.dataset.id = item.id;
      card.dataset.type = item.type;
      
      // Créer le lien
      const link = document.createElement('a');
      link.className = 'movie-link';
      link.href = `content-details.html?id=${item.id}&type=${item.type}`;
      link.setAttribute('aria-label', `Voir ${item.title}`);
      
      // Déterminer l'image à utiliser
      const isMobile = API.isMobileOrTablet();
      const imageUrl = isMobile ? item.images.mobile : item.images.desktop;
      
      // Créer l'image de fond
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = item.title;
      img.loading = 'lazy';
      link.appendChild(img);
      
      // En mode desktop, ajouter l'overlay avec le logo du titre
      if (!isMobile && item.title_logo) {
        console.log(`Ajout du logo pour ${item.title}: ${item.title_logo}`);
        
        // Créer l'overlay avec dégradé
        const overlay = document.createElement('div');
        overlay.className = 'movie-overlay';
        
        // Créer le conteneur du contenu
        const content = document.createElement('div');
        content.className = 'movie-content';
        
        // Créer le conteneur du logo
        const logoContainer = document.createElement('div');
        logoContainer.className = 'movie-logo-container';
        
        // Créer l'image du logo
        const logoImg = document.createElement('img');
        logoImg.className = 'title-logo';
        logoImg.src = item.title_logo;
        logoImg.alt = `Logo de ${item.title}`;
        logoImg.loading = 'lazy';
        
        // Détecter le ratio du logo après chargement
        logoImg.onload = function() {
          const ratio = this.naturalWidth / this.naturalHeight;
          
          // Appliquer la classe appropriée selon le ratio
          if (ratio > 2.5) {
            // Logo très large (1:3 ou plus)
            this.dataset.ratio = 'wide';
          } else if (ratio < 1.5) {
            // Logo presque carré
            this.dataset.ratio = 'square';
          } else {
            // Logo standard (pas besoin d'attribut spécial)
            this.dataset.ratio = 'standard';
          }
        };
        
        // Assembler la structure
        logoContainer.appendChild(logoImg);
        content.appendChild(logoContainer);
        overlay.appendChild(content);
        link.appendChild(overlay);
      }
      
      // Assembler la carte
      card.appendChild(link);
      movieGrid.appendChild(card);
    });
    
    // Retirer la classe de chargement
    movieGrid.classList.remove('loading');
    movieGrid.classList.add('loaded');
    
  } catch (error) {
    console.error('Erreur lors du rendu de la section Top Picks:', error);
  }
}

// Exporter la fonction de rendu
export default {
  render: renderTopPickSection
};