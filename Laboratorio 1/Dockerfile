FROM ubuntu:latest

ARG DEBIAN_FRONTEND=noninteractive

# Instalar Apache, Python, WSGI y herramientas
RUN apt-get update && apt-get install -y \
    apache2 \
    apache2-utils \
    python3 \
    python3-pip \
    libapache2-mod-wsgi-py3 \
    python3-venv \
    nano \
    && apt-get clean

# Habilitar el módulo WSGI
RUN a2enmod wsgi

COPY . /var/www/html/

RUN echo "WSGIScriptAlias /ATI/index.py /var/www/html/index.py" > /etc/apache2/conf-available/reto07.conf
RUN a2enconf reto07

# Permisos y configuración de directorio (Para evitar error 403 Forbidden)
# Le decimos a Apache que permita ejecutar scripts en esa carpeta
RUN echo "<Directory /var/www/html>\n\
    Options +ExecCGI\n\
    AddHandler wsgi-script .py\n\
    Require all granted\n\
</Directory>" >> /etc/apache2/conf-available/reto07.conf

# Dar permisos de ejecución al archivo
RUN chmod 755 /var/www/html/index.py

EXPOSE 80

CMD ["apache2ctl", "-D", "FOREGROUND"]