import json
import os
from http import cookies

# --- FUNCIÓN DE LIMPIEZA
def parse_js_json(ruta_archivo):
    try:
        if not os.path.exists(ruta_archivo):
            return None 
        with open(ruta_archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
            
        inicio_obj = contenido.find('{')
        inicio_arr = contenido.find('[')
        
        inicio = -1
        fin = -1
        
        if inicio_arr != -1 and (inicio_obj == -1 or inicio_arr < inicio_obj):
            inicio = inicio_arr
            fin = contenido.rfind(']') + 1
        elif inicio_obj != -1:
            inicio = inicio_obj
            fin = contenido.rfind('}') + 1
             
        if inicio != -1:
            json_limpio = contenido[inicio:fin]
            return json.loads(json_limpio)
        return None
    except Exception as e:
        print(f"Error parseando {ruta_archivo}: {e}")
        return None

# --- GENERADORES DE HTML

def render_header():
    return """
    <header>
        <nav>
            <ul>
                <div class="nombre-pagina">
                    <li id="sitio-title">ATI<span class="ucv-small">[ucv]</span> 2025-2</li>
                </div>
                <div class="usuario">
                    <li id="user-greeting">Hola, Thibisay</li>
                </div>
                <div class="search-container">
                    <li>
                        <form class="search-form">
                            <input id="search-input" type="text" placeholder="Nombre..." aria-label="Buscar">
                            <button id="search-btn" type="submit">Buscar</button>
                        </form>
                    </li>
                </div>
            </ul>
        </nav>
    </header>
    """

def render_footer():
    return """
    <footer>
        <p id="footer-text">Copyright &copy; 2025 Escuela de computación - ATI</p>
    </footer>
    """

def render_home(estudiantes, lang):
    html_cards = ""
    if estudiantes:
        for est in estudiantes:
            img_path = est.get('imagen', '').replace('\\', '/')
            if '/' not in img_path:
                img_path = f"{est.get('ci')}/{img_path}"
            
            html_cards += f"""
            <a href="/ATI/index.py?ci={est.get('ci')}&lang={lang}" style="text-decoration:none; color:inherit;">
                <li class="person-card">
                    <picture>
                        <img src="/{img_path}" alt="{est.get('nombre')}" class="foto">
                    </picture>
                    <p>{est.get('nombre')}</p>
                </li>
            </a>
            """
    
    return f"""
    <section>
        <ul class="gallery">
            {html_cards}
        </ul>
    </section>
    """

def render_perfil_card(datos, ci_solicitada, lang):
    def fmt_list(key):
        val = datos.get(key, [])
        if isinstance(val, list):
            return ", ".join(val)
        return val

    img_nombre = datos.get('imagen', '')
    ruta_img = f"/{ci_solicitada}/{img_nombre}"

    return f"""
    <div class="perfil-card">
        <div class="foto-container">
            <picture>
                <img src="{ruta_img}" class="foto-perfil" alt="{datos.get('nombre')}">
            </picture>
        </div>
        <div class="content-container">
            <div class="nombre">{datos.get('nombre')}</div>
            <p class="content-text"><b><i>{datos.get('descripcion')}</i></b></p>
            
            <div class="details-container">
                <div class="preguntas-container">
                    <span id="lbl_color">Color favorito:</span> <br>
                    <span id="lbl_libro">Libro favorito:</span> <br>
                    <span id="lbl_musica">Música favorita:</span> <br>
                    <span id="lbl_juego">Videojuegos:</span> <br>
                    <b><span id="lbl_lenguajes">Lenguajes:</span></b> <br>
                </div>
                <div class="respuestas-container">
                    {datos.get('color')} <br>
                    {fmt_list('libro')} <br>
                    {fmt_list('musica')} <br>
                    {fmt_list('video_juego')} <br>
                    <b>{fmt_list('lenguajes')}</b> <br>
                </div>
            </div>

            <div class="correo-container">
                Si necesitas comunicarte conmigo: <a href="mailto:{datos.get('email')}" class="email-link">{datos.get('email')}</a>
                <br><br>
            </div>
        </div>
    </div>
    """

# --- APLICACIÓN PRINCIPAL

def application(environ, start_response):
    # Cookies
    cookie = cookies.SimpleCookie()
    if 'HTTP_COOKIE' in environ:
        cookie.load(environ['HTTP_COOKIE'])
    if 'user_session' not in cookie:
        cookie['user_session'] = 'invitado'
        cookie['user_session']['path'] = '/'

    headers = [('Content-Type', 'text/html; charset=utf-8')]
    if 'user_session' in cookie:
        headers.append(('Set-Cookie', cookie.output(header='').strip()))

    # Parámetros
    query_string = environ.get('QUERY_STRING', '')
    params = {}
    if query_string:
        for param in query_string.split('&'):
            if '=' in param:
                key, value = param.split('=', 1)
                params[key] = value
    
    ci_solicitada = params.get('ci')
    lang = params.get('lang', 'ES')

    ruta_index = "/var/www/html/datos/index.json"
    estudiantes_data = parse_js_json(ruta_index) or []
    estudiantes_json_str = json.dumps(estudiantes_data)

    contenido_body = ""
    clase_body = ""
    
    if ci_solicitada:
        # --- VISTA PERFIL ---
        ruta_json = f"/var/www/html/{ci_solicitada}/perfil.json"
        datos = parse_js_json(ruta_json)
        
        if datos:
            clase_body = 'class="perfil-body"'
            contenido_body = render_perfil_card(datos, ci_solicitada, lang)
        else:
            contenido_body = f"<h1>Perfil no encontrado</h1><a href='/ATI/index.py?lang={lang}'>Volver</a>"
    else:
        # --- VISTA HOME ---
        clase_body = "" 
        contenido_body = render_header() + render_home(estudiantes_data, lang) + render_footer()

    # JAVASCRIPT INYECTADO
    script_fetch = f"""
    <script>
        const listaPerfiles = {estudiantes_json_str};
        let config = {{}}; 

        document.addEventListener('DOMContentLoaded', function() {{
            const lang = '{lang}';
            const configPath = '/conf/config' + lang + '.json';
            
            fetch(configPath)
                .then(response => response.text())
                .then(text => {{
                    const jsonText = text.substring(text.indexOf('{{'), text.lastIndexOf('}}') + 1);
                    try {{
                        config = JSON.parse(jsonText);
                        
                        // --- 1. ACTUALIZACIÓN DEL SITIO (HOME) ---
                        
                        // Título del navegador (Pestaña)
                        if (config.sitio && config.sitio.length >= 3) {{
                            document.title = config.sitio[0] + ' ' + config.sitio[1] + ' ' + config.sitio[2];
                        }}

                        // Título del Header
                        if(document.getElementById('sitio-title')) {{
                            document.getElementById('sitio-title').innerHTML = config.sitio[0] + '<span class="ucv-small">' + config.sitio[1] + '</span> ' + config.sitio[2];
                        }}

                        // Botón de Buscar
                        if(document.getElementById('search-btn')) {{
                            document.getElementById('search-btn').innerText = config.buscar;
                        }}

                        // Placeholder del Input Buscar
                        if(document.getElementById('search-input')) {{
                            document.getElementById('search-input').placeholder = config.nombre; 
                        }}

                        // Saludo (Manteniendo el nombre)
                        const userGreeting = document.getElementById('user-greeting');
                        if (userGreeting) {{
                            const currentText = userGreeting.textContent.trim();
                            // Intentamos separar "Hola, Nombre"
                            const parts = currentText.split(',');
                            const userName = parts.length > 1 ? parts[1].trim() : 'Thibisay';
                            userGreeting.textContent = config.saludo + ', ' + userName;
                        }}

                        // Footer
                        const footerText = document.getElementById('footer-text');
                        if (footerText) {{
                            footerText.innerHTML = config.copyRight; 
                        }}
                        
                        // --- 2. ACTUALIZACIÓN DE PERFIL (LABELS) ---
                        if(document.getElementById('lbl_color')) document.getElementById('lbl_color').innerText = config.color + ':';
                        if(document.getElementById('lbl_libro')) document.getElementById('lbl_libro').innerText = config.libro + ':';
                        if(document.getElementById('lbl_musica')) document.getElementById('lbl_musica').innerText = config.musica + ':';
                        if(document.getElementById('lbl_juego')) document.getElementById('lbl_juego').innerText = config.video_juego + ':';
                        if(document.getElementById('lbl_lenguajes')) document.getElementById('lbl_lenguajes').innerText = config.lenguajes + ':';
                        
                        // 3. ACTUALIZACIÓN DEL TEXTO DE CORREO (LÓGICA NUEVA)
                        const correoContainer = document.querySelector('.correo-container');
                        if (correoContainer && config.email) {{
                            const emailLinkNode = correoContainer.querySelector('.email-link');
                            const btnNode = correoContainer.querySelector('.btn'); 

                            if (emailLinkNode) {{
                                const emailHtml = emailLinkNode.outerHTML;
                                // Reemplaza el placeholder [email] con el enlace HTML
                                const newHtmlContent = config.email.replace('[email]', emailHtml);
                                
                                correoContainer.innerHTML = newHtmlContent;
                                
                                // Restauramos el botón
                                if (btnNode) {{
                                    correoContainer.appendChild(document.createElement('br'));
                                    correoContainer.appendChild(document.createElement('br'));
                                    correoContainer.appendChild(btnNode);
                                }}
                            }}
                        }}
                    }} catch (e) {{ console.error(e); }}
                }})
                .catch(err => console.error(err));

            // --- 3. BÚSQUEDA ---
            const searchInput = document.getElementById('search-input');
            const searchForm = document.querySelector('.search-form');

            function crearTarjeta(est) {{
                let ruta = est.imagen.replace(/\\\\/g, '/');
                if (ruta.indexOf('/') === -1) {{ ruta = est.ci + '/' + ruta; }}
                
                // IMPORTANTE: Mantenemos el idioma en el enlace generado
                return `
                <a href="/ATI/index.py?ci=${{est.ci}}&lang={lang}" style="text-decoration:none; color:inherit;">
                    <li class="person-card">
                        <picture><img src="/${{ruta}}" alt="${{est.nombre}}" class="foto"></picture>
                        <p>${{est.nombre}}</p>
                    </li>
                </a>`;
            }}

            function filtrar() {{
                if(!searchInput) return;
                const texto = searchInput.value.toLowerCase().trim();
                const filtrados = listaPerfiles.filter(est => est.nombre.toLowerCase().includes(texto));
                const galeria = document.querySelector('.gallery');
                
                if(galeria) {{
                    if(filtrados.length > 0) {{
                        let html = '';
                        filtrados.forEach(est => html += crearTarjeta(est));
                        galeria.innerHTML = html;
                    }} else {{
                        let msg = (config && config.noAlumnos) ? config.noAlumnos : "No hay alumnos con:";
                        galeria.innerHTML = `<div class="mensaje-no-resultados" style="text-align:center;">${{msg}} "${{texto}}"</div>`;
                    }}
                }}
            }}

            if (searchForm) {{
                searchForm.addEventListener('submit', function(e) {{
                    e.preventDefault();
                    filtrar();
                }});
                if(searchInput) {{ searchInput.addEventListener('input', filtrar); }}
            }}
        }});
    </script>
    """

    # ARMADO FINAL
    html_final = f"""
    <!DOCTYPE html>
    <html lang="{lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ATI SPA</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body {clase_body}>
        {contenido_body}
        {script_fetch}
    </body>
    </html>
    """
    
    start_response('200 OK', headers)
    return [html_final.encode('utf-8')]