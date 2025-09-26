document.addEventListener('DOMContentLoaded', function() {
    
    // Gestion du scroll pour le header
    document.addEventListener('scroll', function() {
        const scrollState = window.scrollY > 10 ? 'scroll' : 'top';
        document.documentElement.setAttribute('data-scroll', scrollState);
    });

    // ======= GESTION DU MODAL PROFIL =======
    
    // Éléments DOM - vérifier s'ils existent
    const profileContainer = document.querySelector('.profile-container');
    if (!profileContainer) return; // Arrêter si les éléments n'existent pas
    
    const profileIcon = profileContainer.querySelector('.profile-icon');
    const profileModal = document.getElementById('profile-modal');
    
    if (!profileIcon || !profileModal) return;
    
    // Variables de contrôle
    let modalTimer = null;
    let isModalVisible = false;
    const modalDelay = 3000;
    
    // Détection mobile ou desktop
    const isMobile = window.matchMedia('(max-width: 768px)').matches || 
                    ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0);
    
    // Afficher le modal
    function showModal() {
        clearTimeout(modalTimer);
        profileModal.style.display = 'block';
        profileModal.style.opacity = '1';
        profileModal.style.visibility = 'visible';
        isModalVisible = true;
    }
    
    // Cacher le modal avec délai
    function hideModalWithDelay() {
        clearTimeout(modalTimer);
        modalTimer = setTimeout(() => {
            profileModal.style.display = 'none';
            profileModal.style.opacity = '0';
            profileModal.style.visibility = 'hidden';
            isModalVisible = false;
        }, modalDelay);
    }
    
    // Cacher le modal immédiatement
    function hideModalImmediately() {
        clearTimeout(modalTimer);
        profileModal.style.display = 'none';
        profileModal.style.opacity = '0';
        profileModal.style.visibility = 'hidden';
        isModalVisible = false;
    }
    
    // Désactiver le comportement hover CSS par défaut
    if (profileContainer.style) {
        profileContainer.classList.add('js-enabled');
    }
    
    if (isMobile) {
        // MOBILE: comportement au clic
        
        // Supprimer le hover CSS pour mobile
        const style = document.createElement('style');
        style.textContent = '.profile-container:hover .profile-modal { display: none; opacity: 0; visibility: hidden; }';
        document.head.appendChild(style);
        
        // Toggle modal au clic
        profileIcon.addEventListener('click', function(e) {
            e.preventDefault();
            if (isModalVisible) {
                hideModalImmediately();
            } else {
                showModal();
            }
        });
        
        // Fermer modal en cliquant ailleurs
        document.addEventListener('click', function(e) {
            if (isModalVisible && 
                !profileModal.contains(e.target) && 
                e.target !== profileIcon && 
                !profileIcon.contains(e.target)) {
                hideModalImmediately();
            }
        });
    } else {
        // DESKTOP: comportement au hover
        
        // Variable pour suivre la souris sur le modal
        let isMouseOverModal = false;
        
        // Hover sur l'icône -> afficher modal
        profileIcon.addEventListener('mouseenter', showModal);
        
        // Quitter l'icône -> vérifier si souris sur modal
        profileIcon.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!isMouseOverModal) {
                    hideModalImmediately();
                }
            }, 50);
        });
        
        // Souris entre dans le modal
        profileModal.addEventListener('mouseenter', function() {
            isMouseOverModal = true;
        });
        
        // Souris quitte le modal -> cacher immédiatement
        profileModal.addEventListener('mouseleave', function() {
            isMouseOverModal = false;
            hideModalImmediately();
        });
    }
});