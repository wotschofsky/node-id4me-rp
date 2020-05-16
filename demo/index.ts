import fs from 'fs';
import path from 'path';
import https from 'https';
import express from 'express';
import handlebars from 'express-handlebars';
import session from 'express-session';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import * as id4me from '../src/index';

// Load .env file
dotenv.config();

// Setup lowdb
const REGISTERED_APPLICATIONS = 'applicationCredentials';

const adapter = new FileSync('database.json');
const db = lowdb(adapter);
db.defaults({
  [REGISTERED_APPLICATIONS]: {}
}).write();

const app = express();
const port = process.env.PORT || 3030;

const appRegistrationAdapter = new id4me.ApplicationStorageAdapter(
  async (identifier, data) => {
    db.set(`${REGISTERED_APPLICATIONS}.${identifier}`, data).write();
  },
  async identifier => {
    return db.get(`${REGISTERED_APPLICATIONS}.${identifier}`).value();
  },
  async identifier => {
    db.unset(`${REGISTERED_APPLICATIONS}.${identifier}`).write();
    return true;
  }
);

// Setup middleware
app.use(
  session({
    secret: '735W9cu98P', // This should be put into .env or similar
    resave: false,
    saveUninitialized: true
  })
);
app.use(bodyParser());
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

// Setup front-end routes
app.get('/', (req, res) => {
  res.render('home', {
    loggedIn: req.session!.loggedIn
  });
});

app.get('/login', (req, res) => {
  res.render('login', {
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
      loggedIn: true,
      ...req.session!.userData
    });
  }
});

app.post('/auth', async (req, res) => {
  try {
    const record = await id4me.findDnsRecord(req.body.identifier);

    const app = await id4me.registerApplication(
      record.iss,
      {
        client_name: 'ID4me Node.js Demo',
        redirect_uris: [`${process.env.DOMAIN}/callback`]
      },
      false,
      appRegistrationAdapter
    );

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
    res.redirect(authUrl);
  } catch (err) {
    req.session!.error = `Failed authenticating you: ${err}`;
    res.redirect('/login');
  }
});

app.get('/callback', async (req, res) => {
  try {
    const app = await id4me.registerApplication(
      req.session!.iss,
      {
        client_name: 'ID4me Node.js Demo',
        redirect_uris: [`${process.env.DOMAIN}/callback`]
      },
      false,
      appRegistrationAdapter
    );
    const tokens = await id4me.getTokens(
      req.session!.iss,
      app.client_id,
      app.client_secret,
      req.query.code,
      `${process.env.DOMAIN}/callback`
    );

    const claimsClient = new id4me.ClaimsClient(req.session!.iss, tokens.access_token);
    await claimsClient.loadClaims();
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
