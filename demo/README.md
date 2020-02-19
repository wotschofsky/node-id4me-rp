# Important

Please add a `.env` file with domain the demo app is running on as the option `USE_HTTPS` indicating whether the app should be served using https.
Note that the ID4me standard requires HTTPS so if you decide not to use Node.js HTTPS server you still need to provide an HTTPS option through for example NGINX.
This could look like this for local testing using lvh.me which redirects all traffic to localhost:

`
DOMAIN=https://lvh.me:3030
USE_HTTPS=true
`

or like this when deploying the app to a server:

`
DOMAIN=https://example.com
USE_HTTPS=false
`

In case you decide to use a Node.js provided certificate you may self-sign one using the script found in the `certs` directory.
