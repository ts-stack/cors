import http from 'http';
import { cors, mergeOptions } from '../src';

const hostname = '127.0.0.1';
const port = 3000;
const corsOptions = mergeOptions({
  methods: ['POST'],
});

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  await cors(req, res, corsOptions);
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
