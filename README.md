# Thibisay Palma 30455930

## Ejecución con Docker (Reto 6)

Para levantar este proyecto utilizando Docker, sigue estos pasos:

1. **Construir la imagen:**
    Abre la terminal en la carpeta del proyecto y ejecuta:
    ```bash
    docker build -t reto6-apache .

2. **Levantar el contenedor:** Ejecuta el siguiente comando para iniciar el servidor en el puerto 8080:
    ```bash
    docker run -tid --name contenedor-reto6 -p 8080:80 reto6-apache

3. **Ver el proyecto:**  Abre tu navegador en las siguiente ruta:

    * Inicio: http://localhost:8080/index.html

