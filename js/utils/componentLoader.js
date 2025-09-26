class ComponentLoader {
    static async loadComponent(componentPath, targetSelector) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Erreur lors du chargement de ${componentPath}`);
            }
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                targetElement.innerHTML = html;
            }
        } catch (error) {
            console.error('Erreur de chargement du composant:', error);
        }
    }

    static async loadMultipleComponents(components) {
        const promises = components.map(({ path, target }) => 
            this.loadComponent(path, target)
        );
        await Promise.all(promises);
    }
}

export default ComponentLoader;