# Taller de testeo de redirecciones e inclusiones multi sitio con selenium y docker

## Descripción

Veremos cómo se puede armar un entorno de test de comportamiento de páginas web desplegadas en distintos sitios utilizando linux, docker, docker-compose, nginx, openSSL,  node, express, html, javascript, ruby, selenium y wireshark. Sirve para probar en ambientes previos código productivo sin modificarlo en absoluto, basta de if (desa), a sniffear el tráfico TLS y mockear toda la Internet si hace falta.

## Requisitos
Conocimiento superficial de docker, node, html y javascript o mucha curiosidad.


Para la instalación le he dado los siguientes recursos y luego para operar los valores entre paréntesis:

 - 4 CPUs -> (1 CPU)
 - PAE/NX
 - Network: Bridged Adapter
 - 16GB RAM -> ( 4GB, quizás 2Gb)
 - disco de 30GB -> (10 GB) (sin sonarqube) 



## Instalación del sistema operativo

### Ubuntu Server 20.04.4

 - https://ubuntu.com/download/server
 - cuando ofrece instalar openssh server, aceptarlo
 - cuando ofrece "Featured Server Snaps", elegir docker
 - si se queda para siempre en "downloading and installing security updates", cancelar y reboot

#### Opción: Instalar entorno gráfico
      sudo apt install xorg openbox

#### Opción: No instalar entorno gráfico

Ahorra cerca de 1 GB pero luego hay que acceder desde una máquina que tenga entorno gráfico con:
      ssh -X tsiot@IP.IP.IP.IP


#### Pasos comunes
      sudo apt install firefox tree dirdiff git shunit2
      sudo groupadd docker
      sudo usermod -aG docker ${USER}
      sudo chmod 666 /var/run/docker.sock
      sudo reboot
  
  
#### Guest Additions

Puede ser útil o necesario instalar las guest additions en el caso de usar VirtualBox para el clipboard compartido. No hace falta para el ajuste automático del tamaño de pantalla.


      sudo apt install gcc make perl
      # Devices -> Insert guest additions CD image...
      # abrir terminal en /media/tsiot/VBox_GA*
      sudo sh VBoxLinuxAdditions.run
      # paciencia...
      sudo reboot
 





## Instalaciones y configuraciones adicionales


Las instrucciones para la instalación de node fueron tomadas de
 
 - https://nodejs.org/en/download/
 - https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions-enterprise-linux-fedora-and-snap-packages
 - https://github.com/nodesource/distributions/blob/master/README.md 
 

 

- Instalación node js

      curl -sL https://deb.nodesource.com/setup_17.x | sudo -E bash -
      sudo apt install nodejs

- Setup para pruebas con Selenium

      cat << EOF | sudo tee --append /etc/hosts > /dev/null
      127.0.0.1       sitio1
      127.0.0.1       sitio2
      127.0.0.1       sensor
      EOF

- Alias cómodo para git

      cat << EOF > ~/.gitconfig
      [alias]
            lol = log --graph --decorate --pretty=oneline --abbrev-commit
            lola = log --graph --decorate --pretty=oneline --abbrev-commit --all
            lolg = log --graph --decorate --pretty=format:'%Cgreen %ci %Cblue %h %Cred %d %Creset %s'
      EOF
      
- Obtener el proyecto
 
      git clone https://github.com/cpantel/TSIOT.git

  Si no hubieras hecho el git clone, tendrías que haber ejecutado los comandos comentados.
  
      #mkdir sslcert
      #chmod 0700 sslcert
      #cd sslcert/
      #mkdir certs private newcerts
      #echo '100001' > serial
      #touch certindex.txt


- Generar certificados
 
      cd TSIOT
      chmod 0700 sslcert
      cd sslcert
      openssl req -new -x509 -extensions v3_ca -keyout private/seleniumCAkey.pem -out seleniumCAcert.pem -days 365 -config ./openssl.cnf

Elegir un password 4x8mslRQ7Z

  **Precaución: no usar este password pues aunque el riesgo es bajo, permite firmar certificados en los que luego el sistema va a confiar.**

  Resto enter o a gusto
  
      openssl req -new -nodes -out "sitio1-req.pem" -keyout "private/sitio1-key.pem" -config ./openssl.cnf
      
  Common Name -> sitio1

  Resto enter

      openssl req -new -nodes -out "sitio2-req.pem" -keyout "private/sitio2-key.pem" -config ./openssl.cnf
  
  Common Name -> sitio2

  Resto enter

      openssl req -new -nodes -out "sensor-req.pem" -keyout "private/sensor-key.pem" -config ./openssl.cnf

  Common Name -> sensor, resto enter

      openssl ca -md sha256 -out "sitio1-cert.pem" -config ./openssl.cnf -infiles "sitio1-req.pem"
  
  Ingresar el password, yes, yes

      openssl ca -md sha256 -out "sitio2-cert.pem" -config ./openssl.cnf -infiles "sitio2-req.pem"
  
  Ingresar el password, yes, yes

      openssl ca -md sha256 -out "sensor-cert.pem" -config ./openssl.cnf -infiles "sensor-req.pem"
  
  Ingresar el password, yes, yes

  
- Copiar certificados a los sitios

      cp sitio1-cert.pem sitio2-cert.pem sensor-cert.pem private/sitio1-key.pem private/sitio2-key.pem private/sensor-key.pem ../sites/certs/

      cd ../sensors

  Si no hubieras hecho el git clone, tendrías que haber ejecutado los comandos comentados, pero ya están en el package.json
  
      #npm init
      #npm install express --save
      npm install

- Construir imagenes

      docker build -t testbench/dynamic:0.0.1 .
      cd ../sites
      docker build -t testbench/static:0.0.1 .
      cd ..
      
- Iniciar docker

      docker-compose -f docker-compose-webdriver.yml up

- En otra terminal

      cd selenium

  Si no hubieras hecho el git clone, tendrías que haber ejecutado los comandos comentados, pero ya están en el package.json
  
      #npm init
      #npm install --save mocha
      #npm install --save chai
      #npm install --save geckodriver
      #npm install --save selenium-webdriver
      #npm install --save firefox-profile
      npm install
      
      
  -Acá te debo un npm audit fix / --force

## Probar lo hecho
- Acceso a los sites
 
      wget --no-check-certificate -O- https://sensor/hitcount 2>/dev/null | grep div

  - Debe traer
   
      \<div id="count">-1\</div>
  
      wget --no-check-certificate -O- https://sitio2 2>/dev/null | grep title

  - Debe traer
   
      \<title>Sitio de prueba\</title>

- Ejecutar firefox para que cree los perfiles y cerrarlo
- obtener PERFIL con
  
      basename $( ls /home/tsiot/.mozilla/firefox/*default-release -d )
      
  - corregir profilePath en test.js
  - eliminar /home/tsiot/.mozilla/firefox/?????.default-release/lock
  - para elegir el perfil de firefox: **firefox -no-remote -profileManager**


- Ejecutar el test, va a fallar por falta de CA
 
      npm test

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

      rm /home/tsiot/.mozilla/firefox/?????.default-release/lock
      npm test

# Testeo API con postman

- Instalación postman

      cd
      # Descargar Postman de https://www.postman.com/downloads/
      mkdir bin
      cd bin
      tar -xzf ~/Downloads/Postman-linux-x64-x.x.x.tar.gz
      cd ..
      sudo npm install -g newman

- Resolver nombres

      cat << EOF | sudo tee --append /etc/hosts > /dev/null
      127.0.0.1     api-users.smauec.net
      EOF


- Clonar proyecto referencia
 
      git clone https://github.com/cpantel/SMAUEC.git
      cd SMAUEC

      cat << EOF >.env
      POSTGRES_PASSWORD=12345602
      EOF

      chmod 400 .env
      pushd secrets

      cat << EOF > auth.config.test.js
      module.exports = {
        secret: "secret-key"
      };
      EOF

      chmod 400 auth.config.test.js
    
      cp db.rule.config.test.js.template db.rule.config.test.js
      cp db.user.config.test.js.template db.user.config.test.js
      cp user.admin.config.test.js.template user.admin.config.test.js
      popd

      pushd docker/containers/proxy    ; docker build -t smauec/proxy:0.0.1 .      ; popd
      pushd docker/containers/postgres ; docker build -t smauec/postgres:0.0.1 .   ; popd
      pushd docker/containers/mongo    ; docker build -t smauec/mongo:0.0.1 .      ; popd
      pushd docker/containers/node     ; docker build -t smauec/node:0.0.1 .       ; popd
      pushd api_events                 ; docker build -t smauec/api-events:0.0.1 . ; popd
      pushd api_rules                  ; docker build -t smauec/api-rules:0.0.1 .  ; popd
      pushd api_users                  ; docker build -t smauec/api-users:0.0.1 .  ; popd
      pushd odata                      ; docker build -t smauec/odata:0.0.1 .      ; popd

  Borrar de **proxy/default.conf** las secciones server correspondientes a los **server_name** **pgadmin.smauec.net** y **www.smauec.net**

- Iniciar docker
 
      cp ../TSIOT/docker-compose-api.yml .
      docker-compose -f docker-compose-api.yml -p repo up

- En otra terminal

      cat << EOF | docker exec -i repo_postgres_1 psql -U postgres
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

- Debe devolver

      CREATE ROLE
      CREATE DATABASE


- Volver a la terminal 1 y reinicar docker:

      ^C
      docker-compose -f docker-compose-api.yml -p repo up



## Probar lo hecho

- En otra terminal
 
      cd SMAUEC
      pushd api_events; npm install; popd
      pushd api_rules;  npm install; popd
      pushd api_users;  npm install
      npm test

Esperamos que la mayor parte de los tests si no todos, pasen.
  
- De ahora en mas, el sistema se inicia con sólo ejecutar

      docker-compose -f docker-compose-api.yml -p repo up
  
# Herramientas de seguridad

## wireshark

      sudo apt update
      sudo apt install wireshark nmap testssl.sh
      # Shoud non-superusers be able to capture packets? -> Yes
      sudo addgroup "$USER" wireshark
      # logout/login
  
  Para probar, 
  
      wireshark
  
  debe ofrecer capturar en todas las interfaces.

## wpscan

      sudo apt install ruby-dev ubuntu-dev-tools
      sudo gem install wpscan

   Para probar
  
      wpscan --help
  
  debe emitir opciones de ayuda.

## burpsuite

      # https://portswigger.net/burp/releases
      # Elegir stable, Community, Linux 64-bit
      sh burpsuite_community_linux_v202X_X_X.sh

 Seguir los pasos, no crear symlinks pues sin sudo no se puede en /usr/

 Para probar:
 
       cd ~/BurpSuiteCommunity
       ./BurpSuiteCommunity

  Debe abrir algo

## zap proxy

      https://github.com/zaproxy/zaproxy/releases
      buscar hasta hallar un Lastest, ZAP_2.11.1_Linux.tar.gz  al 2022/03/16
      tar -xf ZAP_2.11.1_Linux.tar.gz

Para probar:

     cd ~/ZAP_2.11.1
    ./BurpSuiteCommunity/jre/bin/java -jar zap-2.11.1.jar

 Debe abrir algo

## ejecuciones

     wpscan --url https://www.angrybirds.com

     testssl https://sensor

# A confirmar...

## Sonarqube

### server
 
     docker pull sonarqube
     docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest
     # tomar nota del token de login
     # localhost:9000 (admin admin)
     # Crear un proyecto (Prueba)
     # Generar token y tomar nota del comando.
 
 
### client

  https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/
 
     $ sonar-scanner \
     -Dsonar.projectKey=Prueba \
     -Dsonar.sources=. \
     -Dsonar.host.url=http://localhost:9000 \
     -Dsonar.login=$TOKEN
  
  
# Anexo

## Instalación de docker según su manual 2021

Las instrucciones para la instalación de docker fueron tomadas  de https://docs.docker.com/install/linux/docker-ce/ubuntu/, en caso de usar Linux Mint 19 reemplazar "focal stable" con "bionic stable"


- Instalación de docker según su manual

     sudo apt remove docker docker-engine docker.io containerd runc
     sudo apt install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
     curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
     sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
     sudo apt update
     sudo apt install docker-ce docker-ce-cli containerd.io docker-compose
     sudo addgroup "$USER" docker
     sudo setcap CAP_NET_BIND_SERVICE=+eip /usr/bin/dockerd
     sudo reboot
