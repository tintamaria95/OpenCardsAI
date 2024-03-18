podman run -it --rm --name cerbot \
-v ./frontend/.nginx/cerbot/:/etc/letsencrypt/ \
docker.io/certbot/dns-ovh:latest certonly \
--agree-tos \
--email tintamaria95@hotmail.fr \
-n \
--dns-ovh \
--dns-ovh-credentials /etc/letsencrypt/ovh_api_credentials.ini \
-d martinld.fr \
-d *.martinld.fr
