document.addEventListener('DOMContentLoaded', function() {
    
    let listaPerfiles = [];

    // --- Parte de traducción segun la configuración 
    
    // Verificamos que la variable global 'config' esté definida
    if (typeof config !== 'undefined') {
        
        // Titulo de la pagina según el idioma cargado
        const sitioTitle = document.getElementById('sitio-title');
        if (sitioTitle) {
            sitioTitle.innerHTML = `${config.sitio[0]}<span class="ucv-small">${config.sitio[1]}</span> ${config.sitio[2]}`;
        }

        const userGreeting = document.getElementById('user-greeting');
        if (userGreeting) {
            const currentText = userGreeting.textContent.trim();
            // Intenta obtener el nombre después de la coma, si no lo encuentra usa 'Thibisay'
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
        console.error('Error de Carga: La variable "config" no se ha encontrado. Asegúrate de que el archivo de configuración exista y esté bien formado.');
    }

    // --- Funciones para Cargar Estudiantes 

    
    function crearTarjetaEstudiante(estudiante) {
        const nombreCompleto = estudiante.nombre;
        // Reemplazamos las barras invertidas (\/) por barras normales (/) si existen
        const rutaImagen = estudiante.imagen.replace(/\\/g, '/');

        return `
            <li class="person-card">
                <picture>
                    <source media="(min-width:1025px) and (max-width:1200px)" srcset="${rutaImagen}">
                    <source media="(min-width:769px) and (max-width:1024px)" srcset="${rutaImagen}">
                    <source media="(min-width:481px) and (max-width:768px)" srcset="${rutaImagen}">
                    <source media="(min-width:320px) and (max-width:480px)" srcset="${rutaImagen}">
                    <img src="${rutaImagen}" alt="${nombreCompleto}" class="foto">
                </picture>
                <p>${nombreCompleto}</p>
            </li>
        `;
    }


    function renderizarEstudiantes(estudiantes) {
        const galeria = document.querySelector('.gallery');
        if (!galeria) {
            console.error('No se encontró el elemento con clase .gallery');
            return;
        }

        // Limpiamos la galería de contenido existente
        galeria.innerHTML = ''; 

        let htmlTarjetas = '';
        estudiantes.forEach(estudiante => {
            htmlTarjetas += crearTarjetaEstudiante(estudiante);
        });
        
        galeria.innerHTML = htmlTarjetas;
    }


    // Verificación y Carga de Perfiles
    if (typeof perfiles !== 'undefined' && Array.isArray(perfiles)) {
        // Si la variable global 'perfiles' existe, la usamos para renderizar
        listaPerfiles = perfiles;
        renderizarEstudiantes(listaPerfiles);
    } else {
        console.error('Error de Carga: La variable "perfiles" no se ha encontrado. Asegúrate de cargar datos/index.json en index.html antes de index.js.');
    }

});