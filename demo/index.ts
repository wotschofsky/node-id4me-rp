import * as id4me from 'id4me-rp';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import handlebars from 'express-handlebars';
import https from 'https';
import path from 'path';
import session from 'cookie-session';

import * as storageAdapters from './storageAdapters';

// Load .env file
dotenv.config();

// Setup Express
const app = express();
const port = process.env.PORT || 3030;

// Load Storage Adapter
let appRegistrationAdapter = id4me.memoryStorageAdapter;
switch (process.env.STORAGE_ADAPTER) {
  case 'lowdb':
    appRegistrationAdapter = storageAdapters.lowdbStorageAdapter;
    break;
  case 'mongo':
    appRegistrationAdapter = storageAdapters.mongoStorageAdapter;
    break;
  case 'firestore':
    appRegistrationAdapter = storageAdapters.firestoreStorageAdapter;
    break;
}

// Initialize RegistrationsClient
const registrationsClient = new id4me.RegistrationsClient(
  {
    client_name: 'ID4me Node.js Demo',
    redirect_uris: [`${process.env.DOMAIN}/callback`]
  },
  appRegistrationAdapter
);

// Setup middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET
  })
);
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

// Setup front-end routes
app.get('/', (req, res) => {
  res.render('home', {
    headEmbed: process.env.HEAD_EMBED,
    loggedIn: req.session!.loggedIn
  });
});

app.get('/login', (req, res) => {
  res.render('login', {
    headEmbed: process.env.HEAD_EMBED,
    identifier: req.cookies.identifier || '',
    loggedIn: req.session!.loggedIn,
    error: req.session!.error
  });
  req.session!.error = null;
});

app.get('/profile', (req, res) => {
  if (!req.session!.loggedIn) {
    res.redirect('/login');
  } else {
    res.render('profile', {
      headEmbed: process.env.HEAD_EMBED,
      loggedIn: true,
      ...req.session!.userData
    });
  }
});

app.post('/auth', async (req, res) => {
  try {
    const record = await id4me.findDnsRecord(req.body.identifier);

    const app = await registrationsClient.getApplication(record.iss);

    const authUrl = await id4me.getAuthenticationUrl({
      claims: {
        userinfo: {
          given_name: {
            reason: `We'd like to welcome you!`
          },
          name: null,
          email: {
            essential: true,
            reason: 'Required to contact you'
          }
        },
        id_token: {
          auth_time: {
            essential: true
          }
        }
      },
      loginHint: req.body.identifier,
      clientId: app.client_id,
      iss: record.iss,
      redirectUri: `${process.env.DOMAIN}/callback`
    });

    req.session!.iss = record.iss;

    // Save identifier as cookie
    res.cookie('identifier', req.body.identifier, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 Days
    });

    res.redirect(authUrl);
  } catch (err) {
    req.session!.error = `Failed authenticating you: ${err}`;
    res.redirect('/login');
  }
});

app.get('/callback', async (req, res) => {
  try {
    const app = await registrationsClient.getApplication(req.session!.iss);

    const tokens = await id4me.getTokens(
      req.session!.iss,
      app.client_id,
      app.client_secret,
      req.query.code as string,
      `${process.env.DOMAIN}/callback`
    );

    const claimsClient = new id4me.ClaimsClient(req.session!.iss, tokens.access_token);
    req.session!.userData = {
      email: await claimsClient.getClaim('email'),
      givenName: await claimsClient.getClaim('given_name'),
      name: await claimsClient.getClaim('name')
    };

    req.session!.loggedIn = true;
    res.redirect('/profile');
  } catch (error) {
    req.session!.error = error;
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session!.loggedIn = false;
  req.session!.identifier = null;
  res.redirect('/');
});

// Start server
const listeningCallback = (): void => {
  console.log(`Server listening on port ${port}`);
};

if (process.env.USE_HTTPS === 'true') {
  https
    .createServer(
      {
        key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
        cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert'))
      },
      app
    )
    .listen(port, listeningCallback);
} else {
  app.listen(port, listeningCallback);
}
