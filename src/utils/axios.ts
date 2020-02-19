import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: true,
  ca: require('ssl-root-cas/latest').create()
});

const instance = axios.create({
  httpsAgent: agent
});

export default instance;
