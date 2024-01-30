## Steps to make this project works:
TODO: make script for a complete installation with one command for convenience.

Some steps may differ depending of your OS.

Below are the specific instructions for an installation with Debian.

- Install nodejs as root
```console
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - &&\
apt-get install -y nodejs
``` 
- Install node package manager "npm" (optional with )
```console
sudo apt-get install -y npm
```

- Install libraries for the front app
```console
cd /frontend
npm i
npm audit fix
```

- Install libraries for the back app
```console
cd ../backend
npm i
npm audit fix
```

- start back and front
```console
npm run start
```
