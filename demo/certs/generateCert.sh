# Taken from https://flaviocopes.com/express-https-self-signed-certificate/
openssl req -nodes -new -x509 -keyout server.key -out server.cert
