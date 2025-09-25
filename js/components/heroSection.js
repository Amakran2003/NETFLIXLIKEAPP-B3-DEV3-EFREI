import API from '../api/index.js';

// Fonction pour charger et afficher la section Hero
export async function renderHeroSection() {
  try {
    console.log('Rendu de la section Hero...');
    const heroSection = document.querySelector('.hero-section');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    
    if (!heroSection || !heroTitle || !heroDescription) {
      console.error('Éléments hero manquants dans le HTML');
      return;
    }
    
    // Ajouter une classe de chargement
    heroSection.classList.add('loading');
    
    // Récupérer les données du hero depuis l'API
    const heroContent = await API.getHeroContent();
    console.log('Données du Hero chargées:', heroContent);
    
    // Décider quelle image utiliser selon l'appareil
    const isMobile = API.isMobileOrTablet();
    const backgroundImage = isMobile ? heroContent.images.mobile : heroContent.images.desktop;
    
    // Appliquer l'image d'arrière-plan
    heroSection.style.backgroundImage = `url(${backgroundImage})`;
    
    // Afficher le logo du titre ou le texte du titre
    // Sur mobile et desktop, on utilise le logo s'il est disponible
    if (heroContent.title_logo) {
      heroTitle.innerHTML = `<img src="${heroContent.title_logo}" alt="${heroContent.title}" class="hero-title-logo">`;
    } else {
      heroTitle.textContent = heroContent.title;
    }
    
    // Mettre à jour la description
    heroDescription.textContent = heroContent.overview;
    
    // Retirer la classe de chargement
    heroSection.classList.remove('loading');
    heroSection.classList.add('loaded');
    
    // Ajouter une classe pour identifier si on est sur mobile ou desktop
    if (isMobile) {
      heroSection.classList.add('hero-mobile');
    } else {
      heroSection.classList.remove('hero-mobile');
    }
    
  } catch (error) {
    console.error('Erreur lors du rendu de la section Hero:', error);
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.classList.remove('loading');
      heroSection.classList.add('error');
    }
  }
}

// Exporter la fonction de rendu
export default {
  render: renderHeroSection
};