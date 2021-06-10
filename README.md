# Taller de testeo de redirecciones e inclusiones multi sitio con selenium y docker

## Descripción

Mostraré cómo se puede armar un entorno de test de comportamiento de páginas web desplegadas en distintos sitios utilizando linux, docker, docker-compose, nginx, openSSL,  node, express, html, javascript, ruby, selenium y wireshark. Sirve para probar en ambientes previos código productivo sin modificarlo en absoluto, basta de if (desa), a sniffear el tráfico TLS y mockear toda la Internet si hace falta.

## Requisitos
Conocimiento superficial de docker, node, html y javascript o mucha curiosidad.


Para la instalación le he dado los siguientes recursos y luego para operar los valores entre paréntesis:

 - 4 CPUs -> (1 CPU)
 - PAE/NX
 - 16GB RAM -> ( 4GB, quizás 2Gb)
 - disco de 30GB -> (12 GB)

Puede ser útil o necesario instalar las gues additions en el caso de usar VirtualBox

 - Conectar devices->guest additions
 - abrir terminal en cd
 - sudo sh VBoxLinuxAdditions.run
 - reboot

Las instrucciones para la instalación de docker fueron tomadas  de https://docs.docker.com/install/linux/docker-ce/ubuntu/, en caso de usar Linux Mint 19 reemplazar "focal stable" con "bionic stable".

Las instrucciones para la instalación de node fueron tomadas de 
- https://nodejs.org/en/download/
- https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions-enterprise-linux-fedora-and-snap-packages
- https://github.com/nodesource/distributions/blob/master/README.md 


## Instalación sistema operativo
### Opción: Linux Mint 20 Mate

- Tras la instalación, eliminar todas las aplicaciones superfluas (casi 1G5) usando botón derecho sobre el link en el menú
  - celluloid
  - pix
  - thunderbird
  - transmission
  - rhythmbox
- Eliminar libreoffice

  -      $ sudo apt --autoremove libreoffice-common

- Upgrade e instalación de algunas herramientas útiles
  -     $ sudo apt update
  -     $ sudo apt upgrade
  -     $ sudo apt clean
  -     $ sudo apt install vim tree openssh-server dirdiff git shunit2

- Instalación de docker según su manual
  -     $ sudo apt remove docker docker-engine docker.io containerd runc
  -     $ sudo apt install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
  -     $ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  -     $ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
  -     $ sudo apt update
  -     $ sudo apt install docker-ce docker-ce-cli containerd.io docker-compose
  -     $ sudo addgroup "$USER" docker
  -     $ sudo setcap CAP_NET_BIND_SERVICE=+eip /usr/bin/dockerd
  -     $ sudo reboot

### Opción: Ubuntu Server 20.04
- cuando ofrece "Featured Server Snaps", elegir docker
#### Subopción: Instalar entorno gráfico
  -     $ sudo apt install xorg openbox

#### Subopción: No instalar entorno gráfico
Ahorra un GB pero luego hay que acceder desde una máquina que tenga entorno gráfico con:
 -     $ ssh -X tsiot@IP



#### Pasos comunes Ubuntu Server
-     $ sudo apt install  firefox
-     $ sudo groupadd docker
-     $ sudo usermod -aG docker ${USER}
-     $ sudo chmod 666 /var/run/docker.sock
-     $ sudo reboot

## Instalaciones y configuraciones adicionales

- Instalación node js
  -     $ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
  -     $ sudo apt install nodejs

- Setup para pruebas con Selenium

      $ cat << EOF | sudo tee --append /etc/hosts > /dev/null
      127.0.0.1       sitio1
      127.0.0.1       sitio2
      127.0.0.1       sensor
      EOF
- Alias cómodo para git

      $ cat << EOF > ~/.gitconfig
      [alias]
            lol = log --graph --decorate --pretty=oneline --abbrev-commit
            lola = log --graph --decorate --pretty=oneline --abbrev-commit --all
            lolg = log --graph --decorate --pretty=format:'%Cgreen %ci %Cblue %h %Cred %d %Creset %s'
      EOF
- Obtener el proyecto
  -     $git clone https://github.com/cpantel/TSIOT.git

  Si no hubieras hecho el git clone, tendrías que haber ejecutado los comandos comentados.
  -     $ #mkdir sslcert
  -     $ #chmod 0700 sslcert
  -     $ #cd sslcert/
  -     $ #mkdir certs private newcerts
  -     $ #echo '100001' > serial
  -     $ #touch certindex.txt


- Generar certificados
  -     $ cd TSIOT
  -     $ chmod 0700 sslcert
  -     $ cd sslcert
  -     $ openssl req -new -x509 -extensions v3_ca -keyout private/seleniumCAkey.pem -out seleniumCAcert.pem -days 365 -config ./openssl.cnf
  Elegir un password 4x8mslRQ7Z

  **Precaución: no usar este password pues aunque el riesgo es bajo, permite firmar certificados en los que luego el sistema va a confiar.**

  Resto enter o a gusto
  -     $ openssl req -new -nodes -out "sitio1-req.pem" -keyout "private/sitio1-key.pem" -config ./openssl.cnf
  Common Name -> sitio1

  Resto enter

  -     $ openssl req -new -nodes -out "sitio2-req.pem" -keyout "private/sitio2-key.pem" -config ./openssl.cnf
  Common Name -> sitio2

  Resto enter

  -     $ openssl req -new -nodes -out "sensor-req.pem" -keyout "private/sensor-key.pem" -config ./openssl.cnf
  Common Name -> sensor, resto enter

  -     $ openssl ca -md sha256 -out "sitio1-cert.pem" -config ./openssl.cnf -infiles "sitio1-req.pem"
  Ingresar el password, yes, yes

  -     $ openssl ca -md sha256 -out "sitio2-cert.pem" -config ./openssl.cnf -infiles "sitio2-req.pem"
  Ingresar el password, yes, yes

  -     $ openssl ca -md sha256 -out "sensor-cert.pem" -config ./openssl.cnf -infiles "sensor-req.pem"
  Ingresar el password, yes, yes
  -     $ cd ../sensors
  Si no hubieras hecho el git clone, tendrías que haber ejecutado los comandos comentados, pero ya están en el package.json
  -     $ #npm init
  -     $ #npm install express --save
  -     $ npm install
- Copiar certificados a los sitios
  -     $ cd ../sslcerts

  -     $ cp sitio1-cert.pem sitio2-cert.pem sensor-cert.pem private/sitio1-key.pem private/sitio2-key.pem private/sensor-key.pem ../sites/certs/

  -     $ cd ../sites
- Construir imagenes
  -     $ docker build -t testbench/static:0.0.1 .
  -     $ cd ../sensors

  -     $ docker build -t testbench/dynamic:0.0.1 .

  -     $ cd ..
- Iniciar docker
  -     $ docker-compose -f docker-compose-webdriver.yml up
- En otra terminal

  -     $ cd selenium

  Si no hubieras hecho el git clone, tendrías que haber ejecutado los comandos comentados, pero ya están en el package.json
  -     $ #npm init
  -     $ #npm install --save mocha
  -     $ #npm install --save chai
  -     $ #npm install --save geckodriver
  -     $ #npm install --save selenium-webdriver
  -     $ #npm install --save firefox-profile
  -     $ npm install

## Probar lo hecho
- Acceso a los sites
  -     $ wget --no-check-certificate -O- https://sensor/hitcount 2>/dev/null | grep div
  Esperamos:
  -     <div id="count">-1</div>
  -     $ wget --no-check-certificate -O- https://sitio2 2>/dev/null | grep title
  Esperamos:
  -     <title>Sitio de prueba</title>

- Ejecutar firefox para que cree los perfiles y cerrarlo
  - corregir profilePath en test.js
  - eliminar /home/tsiot/.mozilla/firefox/?????.default-release/lock
  - para elegir el perfil de firefox: **firefox -no-remote -profileManager**


- Ejecutar el test, va a fallar por falta de CA
  -     $ npm test

- Agregar seleniumCAkey.pem a firefox
  - about:preferences
  - find in preferences-> cert
  - View Certificates
  - Authorities
  - Import
  - TSIOT/sslcert/seleniumCAcert.pem
  - trust this CA to identify websites
  - ok ok
  - en los bookmarks tenés las urls necesarias

Reejecutar el test
  -     $ npm test

# Testeo API con postman

- Instalación postman
  -     $ cd
  - Descargar Postman
    - https://www.postman.com/downloads/
  -     $ mkdir bin
  -     $ cd bin
  -     $ tar -xzf ~/Downloads/Postman-linux-x64-8.5.1.tar.gz
  -     $ cd ..
  -     $ sudo npm install -g newman

- Configuración de AUT

Duda: para ejecutar los test hace falta que se ejecute **npm install** en cada api. ¿Si lo hiciera antes del build y copiara **node_modules**...?

Recordá usar contraseñas apropiadas.

  -     $ git clone https://github.com/cpantel/SMAUEC.git
  -     $ cd SMAUEC

        $ cat << EOF >.env
        POSTGRES_PASSWORD=12345602
        EOF

  -     $ chmod 400 .env
  -     $ cd secrets

        $ cat << EOF > auth.config.test.js
        module.exports = {
          secret: "secret-key"
        };
        EOF
  -     $ chmod 400 auth.config.test.js
    

  -     $ cp db.rule.config.test.js.template db.rule.config.test.js
  -     $ cp db.user.config.test.js.template db.user.config.test.js
  -     $ cp user.admin.config.test.js.template user.admin.config.test.js
  -     $ cd ..

  -     $ cd docker/containers/proxy    ; docker build -t smauec/proxy:0.0.1 .      ; cd -
  -     $ cd docker/containers/postgres ; docker build -t smauec/postgres:0.0.1 .   ; cd -
  -     $ cd docker/containers/mongo    ; docker build -t smauec/mongo:0.0.1 .      ; cd -
  -     $ cd docker/containers/node     ; docker build -t smauec/node:0.0.1 .       ; cd -
  -     $ cd api_events                 ; docker build -t smauec/api-events:0.0.1 . ; cd -
  -     $ cd api_rules                  ; docker build -t smauec/api-rules:0.0.1 .  ; cd -
  -     $ cd api_users                  ; docker build -t smauec/api-users:0.0.1 .  ; cd -
  -     $ cd odata                      ; docker build -t smauec/odata:0.0.1 .      ; cd -
  -     $ #cd docker/containers/broker   ; docker build -t smauec/broker:0.0.1 .     ; cd -
  -     $ #cd docker/containers/pgadmin  ; docker build -t smauec/pgadmin:0.0.1 .    ; cd -

  Borrar de **proxy/default.conf** las secciones server correspondientes a los **server_name** **pgadmin.smauec.net** y **www.smauec.net**



- Iniciar docker
  -     $ cp ../TSIOT/docker-compose-api.yml .
  -     $ docker-compose -f docker-compose-api.yml -p repo up

- En otra terminal, atención que el último EOF debe estar al comienzo de la línea:

      $ cat << EOF | docker exec -i repo_postgres_1 psql -U postgres
      CREATE ROLE smauec_test WITH
        LOGIN
        NOSUPERUSER
        INHERIT
        NOCREATEDB
        NOCREATEROLE
        NOREPLICATION
        ENCRYPTED PASSWORD 'md523d1028eeda62a632fe09998f10cbde4';
      CREATE DATABASE smauec_test WITH 
        OWNER = smauec_test
        ENCODING = 'UTF8'
        LC_COLLATE = 'en_US.utf8'
        LC_CTYPE = 'en_US.utf8'
        TABLESPACE = pg_default
        CONNECTION LIMIT = -1;
      EOF

- Volver a la terminal 1 y reinicar docker:
  -     $ ^C
  -     $ docker-compose -f docker-compose-api.yml -p repo up

## Probar lo hecho

- En otra terminal
  -     $ cd SMAUEC
  -     $ cd api_events; npm install; cd -
  -     $ cd api_rules;  npm install; cd -
  -     $ cd api_users;  npm install;
  -     $ npm test
  Esperamos que la mayor parte de los tests si no todos, pasen.
  
# Herramientas de seguridad
## Wireshark  
- $ sudo apt install wireshark nmap testssl.sh
  Shoud non-superusers be able to capture packets? -> <Yes>
  
- $ sudo addgroup "$USER" wireshark

  logout/login

## wordpress

### Opción: Linux Mint
- $ sudo apt install ruby-dev

### Opción: Ubuntu 20.x
- $ sudo apt install ruby-dev ubuntu-dev-tools
- $ sudo gem install wpscan

## burpsuite
- https://portswigger.net/burp/releases/download?product=community&version=2021.5.1&type=Linux
- $ sh burpsuite_community_linux_v2021_5_1.sh


## zap proxy
https://github.com/zaproxy/zaproxy/releases/download/v2.10.0/ZAP_2_10_0_unix.sh
- $ sudo sh ZAP_2_10_0_unix.sh

## ejecuciones

- $ wpscan --url https://www.angrybirds.com

- $ testssl https://sensor

## Sonarqube
 
- $ docker pull sonarqube
- $ docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest
tomar nota del token de login
- localhost:9000 (admin admin)
- sonar-scanner \
  -Dsonar.projectKey=prueba \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=$TOKEN
 
