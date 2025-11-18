
document.addEventListener('DOMContentLoaded', function() {
    
    // Verificamos que la variable global 'config' esté definida
    if (typeof config !== 'undefined') {
        
        // Titulo de la pagina según el idima cargado
        const sitioTitle = document.getElementById('sitio-title');
        if (sitioTitle) {
            sitioTitle.innerHTML = `${config.sitio[0]}<span class="ucv-small">${config.sitio[1]}</span> ${config.sitio[2]}`;
        }

        const userGreeting = document.getElementById('user-greeting');
        if (userGreeting) {
            const currentText = userGreeting.textContent.trim();
            const userName = currentText.includes(',') ? currentText.split(',')[1].trim() : 'Thibisay';
            userGreeting.textContent = `${config.saludo}, ${userName}`;
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = config.nombre; 
        }

        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.textContent = config.buscar; 
        }

        const footerText = document.getElementById('footer-text');
        if (footerText) {
            footerText.innerHTML = config.copyRight; 
        }

    } else {
        console.error('Error de Carga: La variable "config" no se ha encontrado. Asegúrate de que el archivo conf/configES.json exista y esté bien formado.');
    }
});