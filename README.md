# @ts-stack/cors

CORS is a node.js package writen in TypeScript for providing a sync and async middleware that can be used to enable [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) with various options.

This package is a fork of express/cors module from [this state](https://github.com/expressjs/cors/tree/f038e772283).

* [Installation](#installation)
* [Usage](#usage)
  * [Simple Usage](#simple-usage-enable-all-cors-requests)
  * [Enabling CORS Pre-Flight](#enabling-cors-pre-flight)

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install cors
```

## Usage

### Simple Usage (Enable *All* CORS Requests)

```js
import http from 'http';
import { cors, mergeOptions } from '../src';

const hostname = '127.0.0.1';
const port = 3000;
const corsOptions = mergeOptions({ origin: 'https://example.com' });

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  await cors(req, res, corsOptions);
  res.setHeader('Content-Type', 'text/plain');
  res.end('This is CORS-enabled for all origins!');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

### Enabling CORS Pre-Flight

Certain CORS requests are considered 'complex' and require an initial
`OPTIONS` request (called the "pre-flight request"). An example of a
'complex' CORS request is one that uses an HTTP verb other than
GET/HEAD/POST (such as DELETE) or that uses custom headers. To enable
pre-flighting, you must add a new OPTIONS handler for the route you want
to support.

# The default configuration

The default configuration is the equivalent of:

```json
{
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}
```

For details on the effect of each CORS header, read [this](https://web.dev/cross-origin-resource-sharing/) article on web.dev.
