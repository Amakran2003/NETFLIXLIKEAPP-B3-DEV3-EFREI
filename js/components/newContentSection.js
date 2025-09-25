import API from '../api/index.js';

// Fonction pour charger et afficher la section "New Content"
export async function renderNewContentSection() {
  try {
    console.log('Rendu de la section New Content...');
    
    // Au lieu de chercher par ID 'new-content-heading', chercher par ID 'new-heading'
    const newContentSection = document.querySelector('#new-heading').closest('.movie-section');
    
    if (!newContentSection) {
      console.error('Section "New on Streamflix" introuvable dans le DOM');
      return;
    }
    
    // Récupérer la grille de films
    const movieGrid = newContentSection.querySelector('.movie-grid');
    if (!movieGrid) {
      console.error('Grille de films introuvable dans la section "New on Streamflix"');
      return;
    }
    
    // Ajouter une classe de chargement
    movieGrid.classList.add('loading');
    
    // Récupérer les données depuis l'API
    const newContent = await API.getNewContent();
    console.log('Données New Content chargées:', newContent.length, 'éléments');
    
    // Vider le contenu actuel (placeholders)
    movieGrid.innerHTML = '';
    
    // Générer les cartes de films (filtrer les items sans images)
    const contentWithImages = newContent.filter(item => 
      item && (item.images?.desktop || item.images?.mobile)
    );
    
    if (contentWithImages.length === 0) {
      console.warn('Aucun contenu avec des images valides trouvé pour New Content');
      movieGrid.innerHTML = '<div class="error-message">Aucun contenu disponible</div>';
    } else {
      // Ajouter les cartes au DOM
      contentWithImages.forEach(item => {
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
      
      console.log(`${contentWithImages.length} cartes ajoutées à la section New Content`);
    }
    
    // Retirer la classe de chargement
    movieGrid.classList.remove('loading');
    movieGrid.classList.add('loaded');
    
  } catch (error) {
    console.error('Erreur lors du rendu de la section New Content:', error);
  }
}

// Exporter la fonction de rendu
export default {
  render: renderNewContentSection
};