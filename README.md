# Thibisay Palma 30455930

## Ejecución con Docker (Reto 7)

Para levantar este proyecto utilizando Docker, sigue estos pasos:

1. **Construir la imagen:**
    Abre la terminal en la carpeta del proyecto y ejecuta:
docker build --no-cache -t reto07Thibisay .
    ```bash
    docker build --no-cache -t reto07_thibisay .

2. **Levantar el contenedor:** Ejecuta el siguiente comando para iniciar el servidor en el puerto 8080:
    ```bash
    docker run -d -p 8080:80 --name reto07_contenedor_thibisay reto07_thibisay

3. **Ver el proyecto:**  Abre tu navegador en las siguiente ruta:

    * Opción 1: http://localhost:8080/ATI/index.py
    * Opción 2: http://localhost:8080/ATI/index.py?lang=ES

