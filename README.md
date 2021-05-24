
# Sistema operativo
## Opción: Linux Mint 20 Mate

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

## Opción: Ubuntu Server 20.04
- cuando ofrece "Featured Server Snaps", elegir docker
### Subopción: Instalar entorno gráfico
  -     $ sudo apt install xorg openbox

### Subopción: No instalar entorno gráfico
Ahorra un GB pero luego hay que acceder desde una máquina que tenga entorno gráfico con:
 -     $ ssh -X tsiot@IP



### Pasos comunes Ubuntu Server
-     $ sudo apt install  firefox
-     $ sudo groupadd docker
-     $ sudo usermod -aG docker ${USER}
-     $ sudo chmod 666 /var/run/docker.sock
-     $ sudo reboot

# Pasos comunes

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
  -     $ docker-compose up
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

# Probar lo hecho
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

Va a fallar por falta de CA
  - $ npm test

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

- $ npm test

