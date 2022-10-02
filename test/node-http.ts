import http from 'http';
import { cors, mergeOptions } from '../src';

const hostname = '127.0.0.1';
const port = 3000;
const corsOptions = mergeOptions({
  origin: 'http://example.com',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
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
