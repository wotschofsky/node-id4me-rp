import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 1200,
  checkperiod: 300
});

export default cache;
