document.addEventListener('DOMContentLoaded', function() {
    
    let listaPerfiles = [];

    // Función que lee el parámetro 'lang' de la URL y devuelve el código de idioma
    function getLanguageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get('lang');
        
        // Mapeamos el código de la URL a un sufijo de archivo válido
        // Por defecto, usamos 'ES' (español) si no se especifica o no es válido.
        const validLangs = ['EN', 'ES', 'PT'];
        const defaultLang = 'ES';

        if (lang && validLangs.includes(lang.toUpperCase())) {
            return lang.toUpperCase();
        }
        return defaultLang;
    }

    // Función auxiliar para usar textos predeterminados si falla la carga de config
    function applyDefaultText() {
        console.warn('Usando textos predeterminados.');
    }

    // Función para cargar dinámicamente el archivo de configuración
    function loadConfigAndRender() {
        const langCode = getLanguageFromUrl(); 
        const configPath = `conf/config${langCode}.json`;

        // Punto de depuración: Ver qué archivo intenta cargar
        console.log(`Cargando archivo de configuración: ${configPath}`);
        
        const script = document.createElement('script');
        script.src = configPath;
        script.type = 'text/javascript';

        script.onload = function() {
            // La variable 'config' ahora está disponible globalmente
            if (typeof config !== 'undefined') {
                console.log('Configuración de idioma cargada exitosamente.');
                // 1. Ejecutamos la lógica de traducción
                applyTranslation();
                // 2. Ejecutamos la lógica de carga de perfiles (después de la traducción)
                loadProfilesAndRender();
            } else {
                console.error(`Error de Carga: La variable "config" no se ha encontrado después de cargar ${configPath}.`);
                // Si falla la carga de config, al menos intentamos cargar los perfiles
                loadProfilesAndRender();
            }
        };

        script.onerror = function() {
            console.error(`Error de Carga: Error al intentar cargar el archivo de configuración: ${configPath}.`);
            applyDefaultText();
            // Si falla la carga de config, al menos intentamos cargar los perfiles
            loadProfilesAndRender();
        };

        document.head.appendChild(script);
    }
    
    // Función para aplicar los textos de la configuración
    function applyTranslation() {
        if (typeof config === 'undefined') {
            console.error('Error: "config" no está definida para la traducción.');
            return;
        }
        
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
    }

    function loadProfilesAndRender() {
        // El código de renderizado de estudiantes se ejecuta aquí.
        if (typeof perfiles !== 'undefined' && Array.isArray(perfiles)) {
            listaPerfiles = perfiles;
            renderizarEstudiantes(listaPerfiles);
        } else {
            console.error('Error de Carga: La variable "perfiles" no se ha encontrado. Asegúrate de cargar datos/index.json en index.html antes de index.js.');
        }
    }
    

    // --- Funciones para Cargar Estudiantes ---
    
    function crearTarjetaEstudiante(estudiante) {
        const nombreCompleto = estudiante.nombre;
        const rutaImagenBase = estudiante.imagen.replace(/\\/g, '/'); 
        const cedula = estudiante.ci; 

        const langCode = getLanguageFromUrl(); 
        
        const perfilURL = `perfil.html?ci=${cedula}&lang=${langCode}`; 

        return `
            <a href="${perfilURL}">
                <li class="person-card">
                    <picture>
                        <img src="${rutaImagenBase}" alt="${nombreCompleto}" class="foto">
                    </picture>
                    <p>${nombreCompleto}</p>
                </li>
            </a>
        `;
    }


    function renderizarEstudiantes(estudiantes) {
        const galeria = document.querySelector('.gallery');
        if (!galeria) {
            console.error('No se encontró el elemento con clase .gallery');
            return;
        }

        galeria.innerHTML = ''; 

        let htmlTarjetas = '';
        estudiantes.forEach(estudiante => {
            htmlTarjetas += crearTarjetaEstudiante(estudiante);
        });
        
        galeria.innerHTML = htmlTarjetas;
    }


    // --- LÓGICA DE BÚSQUEDA ---

    const searchInput = document.getElementById('search-input');
    const searchForm = document.querySelector('.search-form');

    function filtrarEstudiantes() {
        const textoBusqueda = searchInput.value.toLowerCase().trim();

        // Verificamos si el nombre incluye el texto escrito
        const estudiantesFiltrados = listaPerfiles.filter(estudiante => 
            estudiante.nombre.toLowerCase().includes(textoBusqueda)
        );

        if (estudiantesFiltrados.length > 0) {
            // Si hay coincidencias, renderizamos las tarjetas
            renderizarEstudiantes(estudiantesFiltrados);
        } else {
            // Si no hay coincidencias, mostramos el mensaje especial
            mostrarMensajeNoEncontrado(searchInput.value);
        }
    }

    function mostrarMensajeNoEncontrado(query) {
        const galeria = document.querySelector('.gallery');
        if (!galeria) return;

        let mensajeTexto = "No hay alumnos que tengan en su nombre"; 
        
        if (typeof config !== 'undefined' && config.noAlumnos) {
            mensajeTexto = config.noAlumnos;
        }
        galeria.innerHTML = `
            <div class="mensaje-no-resultados">
                ${mensajeTexto} ${query}
            </div>
        `;
    }


    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filtrarEstudiantes();
        });
    }

    loadConfigAndRender();

});