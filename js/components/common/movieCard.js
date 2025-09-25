import API from '../../api/index.js';

// Fonction pour créer une carte de film standard
export function createMovieCard(item) {
  // Vérifier que l'item existe et a au moins une image
  if (!item) {
    return document.createElement('div');
  }
  
  const isMobile = API.isMobileOrTablet();
  
  // Choisir l'image selon l'appareil
  let imageUrl;
  if (isMobile) {
    imageUrl = item.images.mobile || item.images.desktop;
  } else {
    imageUrl = item.images.desktop || item.images.mobile;
  }
  
  // Créer l'élément article
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
  
  // Créer l'image
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = item.title;
  img.loading = 'lazy';
  
  // Ajouter uniquement le logo si disponible et en desktop
  if (!isMobile && item.title_logo) {
    const logoOverlay = document.createElement('div');
    logoOverlay.className = 'logo-overlay desktop-only';
    
    const logoImg = document.createElement('img');
    logoImg.src = item.title_logo;
    logoImg.alt = `Logo ${item.title}`;
    logoImg.className = 'title-logo';
    
    logoOverlay.appendChild(logoImg);
    link.appendChild(img);
    link.appendChild(logoOverlay);
  } else {
    link.appendChild(img);
  }
  
  card.appendChild(link);
  return card;
}

// Fonction pour créer une carte Top 10
export function createTop10Card(item, rank) {
  // Vérifier que l'item existe
  if (!item) {
    return document.createElement('div');
  }
  
  // Pour Top 10, on utilise toujours l'image mobile (format 9:16)
  const imageUrl = item.images.mobile || item.images.desktop;
  
  // Créer l'élément article
  const card = document.createElement('article');
  card.className = 'top-10-card';
  card.setAttribute('role', 'listitem');
  card.dataset.id = item.id;
  card.dataset.type = item.type;
  
  // Créer le lien
  const link = document.createElement('a');
  link.className = 'movie-link';
  link.href = `content-details.html?id=${item.id}&type=${item.type}`;
  link.setAttribute('aria-label', `Voir ${item.title} (n°${rank})`);
  
  // Créer le numéro de classement
  const rankElement = document.createElement('div');
  rankElement.className = 'top-10-number';
  rankElement.setAttribute('aria-hidden', 'true');
  rankElement.textContent = rank || item.rank;
  
  // Créer l'image
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = item.title;
  img.loading = 'lazy';
  
  // Assembler les éléments (sans overlay de titre)
  link.appendChild(rankElement);
  link.appendChild(img);
  card.appendChild(link);
  
  return card;
}