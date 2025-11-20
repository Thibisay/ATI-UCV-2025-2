// 1. Obtener la Cédula (CI) del parámetro de la URL
const urlParams = new URLSearchParams(window.location.search);
const ci = urlParams.get('ci');

// Si no hay CI, detenemos la ejecución y mostramos un error
if (!ci) {
    document.body.innerHTML = '<h1>Error: No se ha especificado la Cédula de Identidad del perfil.</h1>';
    document.title = 'Perfil no encontrado';
    throw new Error('CI no especificada en la URL.'); 
}

// 2. Construir la ruta al archivo perfil.json
const perfilJsonPath = `${ci}/perfil.json`;

// 3. Crear y adjuntar el script para cargar el perfil
const script = document.createElement('script');
script.src = perfilJsonPath;
script.type = 'text/javascript';

// 4. Esperar a que el script se cargue y la variable 'perfil' esté disponible
script.onload = function() {
    // La variable 'perfil' ahora está definida globalmente por el archivo perfil.json
    if (typeof perfil !== 'undefined' && perfil.ci === ci) {
        renderizarPerfil(perfil);
    } else {
        mostrarErrorCarga(`No se pudo cargar el perfil para la CI: ${ci}. Asegúrate de que el archivo ${perfilJsonPath} exista y defina la variable 'perfil'.`);
    }
};

script.onerror = function() {
    mostrarErrorCarga(`Error al intentar cargar el archivo: ${perfilJsonPath}. Verifica la ruta y que el archivo exista.`);
};

// 5. Añadir el script al head para que se ejecute y cargue la variable 'perfil'
document.head.appendChild(script);


// --- Funciones de Soporte ---

/**
 * Muestra un mensaje de error en la página.
 * @param {string} mensaje - El mensaje de error a mostrar.
 */
function mostrarErrorCarga(mensaje) {
    console.error('Error de Carga:', mensaje);
    document.body.innerHTML = `<h1>Error de Carga</h1><p>${mensaje}</p>`;
    document.title = 'Error de Carga';
}


/**
 * Rellena el HTML con los datos del perfil cargado.
 * @param {Object} data - El objeto 'perfil' cargado del archivo JS.
 */
function renderizarPerfil(data) {
    // 1. Actualizar el Título de la Página
    document.title = data.nombre;

    // 2. Contenedor de la Foto
    const fotoContainer = document.querySelector('.foto-container picture');
    const imagenPath = `${data.ci}/${data.imagen}`; // ¡Ruta Corregida para la imagen!
    
    if (fotoContainer) {
        fotoContainer.innerHTML = `<img src="${imagenPath}" alt="${data.nombre}" class="foto-perfil">`;
    }

    // 3. Nombre
    const nombreDiv = document.querySelector('.nombre');
    if (nombreDiv) {
        nombreDiv.textContent = data.nombre;
    }
    
    // 4. Descripción
    // Usamos querySelector para buscar el texto dentro de <i>
    const descripcionElement = document.querySelector('.content-container > p > b > i');
    if (descripcionElement) {
        descripcionElement.textContent = data.descripcion;
    }

    // 5. Detalles (Respuestas)
    const respuestasContainer = document.querySelector('.respuestas-container');
    if (respuestasContainer) {
        // Generamos el HTML de las respuestas, asegurando manejar arrays
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
        correoContainer.innerHTML = `Si necesitas comunicarte conmigo me puedes escribir a: <a href="mailto:${data.email}">${data.email}</a>`;
    }
}