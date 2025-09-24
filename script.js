// Solution minimale pour détecter le scroll avec CSS
document.addEventListener('DOMContentLoaded', function() {
    // Ajout de l'attribut data-scroll à l'élément html
    document.addEventListener('scroll', function() {
        const scrollState = window.scrollY > 10 ? 'scroll' : 'top';
        document.documentElement.setAttribute('data-scroll', scrollState);
    });

    // ======= GESTION DU MODAL PROFIL =======
    
    // Éléments DOM
    const profileContainer = document.querySelector('.profile-container');
    const profileIcon = profileContainer.querySelector('.profile-icon');
    const profileModal = document.getElementById('profile-modal');
    
    // Variables de contrôle
    let modalTimer = null;
    let isModalVisible = false;
    const modalDelay = 3000; // 3 secondes avant fermeture
    
    // Détection si mobile (tactile) ou desktop
    const isMobile = window.matchMedia('(max-width: 768px)').matches || 
                    ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0);
    
    // Fonction pour afficher le modal
    function showModal() {
        clearTimeout(modalTimer);
        profileModal.style.display = 'block';
        profileModal.style.opacity = '1';
        profileModal.style.visibility = 'visible';
        isModalVisible = true;
    }
    
    // Fonction pour cacher le modal avec délai
    function hideModalWithDelay() {
        clearTimeout(modalTimer);
        modalTimer = setTimeout(() => {
            profileModal.style.display = 'none';
            profileModal.style.opacity = '0';
            profileModal.style.visibility = 'hidden';
            isModalVisible = false;
        }, modalDelay);
    }
    
    // Fonction pour cacher le modal immédiatement
    function hideModalImmediately() {
        clearTimeout(modalTimer);
        profileModal.style.display = 'none';
        profileModal.style.opacity = '0';
        profileModal.style.visibility = 'hidden';
        isModalVisible = false;
    }
    
    // On désactive le comportement hover CSS par défaut
    if (profileContainer.style) {
        profileContainer.classList.add('js-enabled');
    }
    
    // Comportement différent selon mobile ou desktop
    if (isMobile) {
        // MOBILE: comportement au clic
        
        // Suppression du hover CSS pour mobile
        const style = document.createElement('style');
        style.textContent = '.profile-container:hover .profile-modal { display: none; opacity: 0; visibility: hidden; }';
        document.head.appendChild(style);
        
        // Événement toggle sur le clic de l'icône
        profileIcon.addEventListener('click', function(e) {
            e.preventDefault();
            if (isModalVisible) {
                hideModalImmediately();
            } else {
                showModal();
            }
        });
        
        // Fermer le modal quand on clique ailleurs
        document.addEventListener('click', function(e) {
            if (isModalVisible && 
                !profileModal.contains(e.target) && 
                e.target !== profileIcon && 
                !profileIcon.contains(e.target)) {
                hideModalImmediately();
            }
        });
    } else {
        // DESKTOP: comportement au hover avec délai
        
        // Hover sur l'icône du profil -> affiche le modal
        profileIcon.addEventListener('mouseenter', showModal);
        
        // Si la souris sort de l'icône -> vérifie si elle va sur le modal
        profileIcon.addEventListener('mouseleave', function() {
            // On vérifie si la souris est sur le modal, sinon on le cache immédiatement
            setTimeout(() => {
                if (!isMouseOverModal) {
                    hideModalImmediately();
                }
            }, 50); // Petit délai technique pour laisser le temps à isMouseOverModal de se mettre à jour
        });
        
        // Variable pour suivre si la souris est sur le modal
        let isMouseOverModal = false;
        
        // Si la souris entre dans le modal -> on le note
        profileModal.addEventListener('mouseenter', function() {
            isMouseOverModal = true;
        });
        
        // Si la souris quitte le modal -> on le cache immédiatement
        profileModal.addEventListener('mouseleave', function() {
            isMouseOverModal = false;
            hideModalImmediately();
        });
    }
});