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
    
    heroSection.classList.add('loading');
    
    const heroContent = await API.getHeroContent();
    console.log('Données du Hero chargées:', heroContent);
    
    const isMobile = API.isMobileOrTablet();
    const backgroundImage = isMobile ? heroContent.images.mobile : heroContent.images.desktop;
    
    heroSection.style.backgroundImage = `url(${backgroundImage})`;
 
    if (heroContent.title_logo) {
      heroTitle.innerHTML = `<img src="${heroContent.title_logo}" alt="${heroContent.title}" class="hero-title-logo">`;
    } else {
      heroTitle.textContent = heroContent.title;
    }
    
    heroDescription.textContent = heroContent.overview;
    
    heroSection.classList.remove('loading');
    heroSection.classList.add('loaded');
    
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

export default {
  render: renderHeroSection
};