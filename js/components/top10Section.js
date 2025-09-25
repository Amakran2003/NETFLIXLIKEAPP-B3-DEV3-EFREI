import API from '../api/index.js';
import { createTop10Card } from './common/movieCard.js';

// Fonction pour charger et afficher la section "Top 10 TV Shows"
export async function renderTop10Section() {
  try {
    console.log('Rendu de la section Top 10...');
    const top10Section = document.querySelector('.movie-section #top-10-heading')?.closest('.movie-section');
    const top10Grid = top10Section?.querySelector('.top-10-grid');
    
    if (!top10Section || !top10Grid) {
      console.error('Éléments Top 10 manquants dans le HTML');
      return;
    }
    
    // Ajouter une classe de chargement
    top10Grid.classList.add('loading');
    
    // Récupérer les données depuis l'API
    const top10Shows = await API.getTop10Shows();
    console.log('Données Top 10 chargées:', top10Shows.length, 'éléments');
    
    // Vider le contenu actuel (placeholders)
    top10Grid.innerHTML = '';
    
    // Générer les cartes Top 10
    top10Shows.forEach((item, index) => {
      const card = createTop10Card(item, index + 1);
      top10Grid.appendChild(card);
    });
    
    // Retirer la classe de chargement
    top10Grid.classList.remove('loading');
    top10Grid.classList.add('loaded');
    
  } catch (error) {
    console.error('Erreur lors du rendu de la section Top 10:', error);
    const top10Grid = document.querySelector('.movie-section #top-10-heading')?.closest('.movie-section')?.querySelector('.top-10-grid');
    if (top10Grid) {
      top10Grid.classList.remove('loading');
      top10Grid.classList.add('error');
    }
  }
}

// Exporter la fonction de rendu
export default {
  render: renderTop10Section
};