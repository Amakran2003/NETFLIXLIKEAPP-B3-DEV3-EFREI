// Point d'entrée principal pour l'application

// Importer les composants de rendu
import heroSection from './components/heroSection.js';
import nextWatchSection from './components/nextWatchSection.js';
import top10Section from './components/top10Section.js';
import newContentSection from './components/newContentSection.js';
import topPickSection from './components/topPickSection.js';
// Les autres imports seront ajoutés au fur et à mesure

// Fonction d'initialisation principale
async function initApp() {
  console.log('Initialisation de StreamFlix...');
  
  try {
    // Charger la section Hero en premier
    await heroSection.render();
    
    // Charger les autres sections en parallèle
    await Promise.all([
      nextWatchSection.render(),
      top10Section.render(),
      newContentSection.render(),
      topPickSection.render()
      // Ajouter d'autres sections ici quand elles seront implémentées
    ]);
    
    console.log('Toutes les sections ont été chargées avec succès');
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'application:', error);
  }
}

// Exécuter l'initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', initApp);