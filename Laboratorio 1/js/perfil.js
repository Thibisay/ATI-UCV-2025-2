// Variable global para almacenar los datos del perfil una vez cargados.
let perfilData = null; 

// --- Funciones de Utilidad y Configuración de Idioma ---

function getLanguageFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    
    const validLangs = ['EN', 'ES', 'PT'];
    const defaultLang = 'ES';

    if (lang && validLangs.includes(lang.toUpperCase())) {
        return lang.toUpperCase();
    }
    return defaultLang;
}

// Aplica los textos traducidos al HTML del perfil. 
function applyTranslation() {
    if (typeof config === 'undefined' || !perfilData) {
        console.warn('Advertencia: Configuración o datos del perfil no disponibles para traducción.');
        return;
    }
    
    // 1. Contenedor de Preguntas: Traduce los textos estáticos.
    const preguntasContainer = document.querySelector('.preguntas-container');
    if (preguntasContainer) {
        preguntasContainer.innerHTML = `
            ${config.color}: <br>
            ${config.libro}: <br>
            ${config.musica}: <br>
            ${config.video_juego}: <br>
            <b>${config.lenguajes}: </b><br>
        `;
    }

    // 2. Correo Electrónico: Traduce el texto introductorio del correo usando la clave 'email'.
    const correoContainer = document.querySelector('.correo-container');

    const emailLink = `<a href="mailto:${perfilData.email}">${perfilData.email}</a>`;

    const emailText = config.email.replace('[email]', emailLink);
    
    if (correoContainer) {
        correoContainer.innerHTML = emailText; 
    }
}


/* Carga dinámicamente el archivo de configuración de idioma y ejecuta la traducción */
function loadConfigAndRender() {
    const langCode = getLanguageFromUrl(); 
    const configPath = `conf/config${langCode}.json`; 

    console.log(`Cargando archivo de configuración para perfil: ${configPath}`);
    
    const scriptConfig = document.createElement('script');
    scriptConfig.src = configPath;
    scriptConfig.type = 'text/javascript';

    scriptConfig.onload = function() {
        if (typeof config !== 'undefined') {
            console.log('Configuración de idioma cargada exitosamente.');
            // Aplicamos la traducción inmediatamente
            applyTranslation();
        } else {
            console.error(`Error: La variable "config" no se ha encontrado después de cargar ${configPath}.`);
        }
    };

    scriptConfig.onerror = function() {
        console.error(`Error al cargar el archivo de configuración: ${configPath}.`);
    };

    document.head.appendChild(scriptConfig);
}

/* Logica para cargar la información en el perfil */

// 1. Obtener la Cédula (CI)
const urlParams = new URLSearchParams(window.location.search);
const ci = urlParams.get('ci');

if (!ci) {
    document.body.innerHTML = '<h1>Error: No se ha especificado la Cédula de Identidad del perfil.</h1>';
    document.title = 'Perfil no encontrado';
    throw new Error('CI no especificada en la URL.'); 
}

// 2. Construir la ruta al archivo perfil.json
const perfilJsonPath = `${ci}/perfil.json`;

// 3. Crear y adjuntar el script para cargar el perfil
const scriptPerfil = document.createElement('script');
scriptPerfil.src = perfilJsonPath;
scriptPerfil.type = 'text/javascript';

scriptPerfil.onload = function() {
    if (typeof perfil !== 'undefined' && perfil.ci === ci) {
        perfilData = perfil; 
        renderizarPerfil(perfilData); 
        
        // Carga el idioma después de renderizar el perfil
        loadConfigAndRender(); 
    } else {
        mostrarErrorCarga(`No se pudo cargar el perfil para la CI: ${ci}.`);
    }
};

scriptPerfil.onerror = function() {
    mostrarErrorCarga(`Error al intentar cargar el archivo: ${perfilJsonPath}.`);
};

// 4. Añadir el script del perfil al head
document.head.appendChild(scriptPerfil);



function mostrarErrorCarga(mensaje) {
    console.error('Error de Carga:', mensaje);
    document.body.innerHTML = `<h1>Error de Carga</h1><p>${mensaje}</p>`;
    document.title = 'Error de Carga';
}


/* Rellena el HTML con los datos del perfil cargado. */
function renderizarPerfil(data) {
    // 1. Actualizar el Título de la Página
    document.title = data.nombre;

    // 2. Foto
    const fotoContainer = document.querySelector('.foto-container picture');
    const imagenPath = `${data.ci}/${data.imagen}`; 
    if (fotoContainer) {
        fotoContainer.innerHTML = `<img src="${imagenPath}" alt="${data.nombre}" class="foto-perfil">`;
    }

    // 3. Nombre
    const nombreDiv = document.querySelector('.nombre');
    if (nombreDiv) {
        nombreDiv.textContent = data.nombre;
    }
    
    // 4. Descripción
    const descripcionElement = document.querySelector('.content-container > p > b > i');
    if (descripcionElement) {
        descripcionElement.textContent = data.descripcion;
    }

    // 5. Detalles (Respuestas)
    const respuestasContainer = document.querySelector('.respuestas-container');
    if (respuestasContainer) {
        const lenguajes = Array.isArray(data.lenguajes) ? data.lenguajes.join(', ') : data.lenguajes;
        const musica = Array.isArray(data.musica) ? data.musica.join(', ') : data.musica;
        const libro = Array.isArray(data.libro) ? data.libro.join(', ') : data.libro;
        const videojuego = Array.isArray(data.video_juego) ? data.video_juego.join(', ') : data.video_juego;
        
        let respuestasHTML = `
            ${data.color} <br>
            ${libro} <br>
            ${musica} <br>
            ${videojuego} <br>
            <b>${lenguajes}</b> <br>
        `;
        respuestasContainer.innerHTML = respuestasHTML;
    }
    
    // 6. Correo Electrónico
    const correoContainer = document.querySelector('.correo-container');
    if (correoContainer) {
        // Mantiene un texto temporal o el por defecto, applyTranslation lo modificará con el texto traducido.
        correoContainer.innerHTML = `Si necesitas comunicarte conmigo me puedes escribir a: <a href="mailto:${data.email}">${data.email}</a>`; 
    }
}