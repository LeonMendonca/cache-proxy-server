import http, { IncomingMessage } from "http"
import { URL } from "url";
import { CacheService } from "./keyv-redis";
import { requestServer } from "./httpReq";

const PORT: number = 2900;
const baseUrl = `http://localhost:${PORT}`

const server = http.createServer();

const cacheService = new CacheService();

server.on('request', async (req, res)=> {
  try {
    if(!req.url) { 
      throw new Error("No URL"); 
    }
    const url = new URL(`${baseUrl}${req.url}`);
    const value = await cacheService.get(url.pathname);
    if(value) {
      res.writeHead(200, "OK", {
        'Content-Type': 'text/plain',
        'X-Cache': 'hit',
        'Content-Length': Buffer.byteLength(value),
      });
      res.write(value);
    } else {
      const rawData = await requestServer(url.pathname);
      const data = await JSON.parse(rawData);
      res.writeHead(200, "OK", {
        'Content-Type': 'text/plain',
        'X-Cache': 'miss',
        'Content-Length': Buffer.byteLength(data),
      });
      res.write(data);
      await cacheService.set(url.pathname, rawData);
    }
    res.end();
  } catch (error) {
    errorHandler(error, req, res);
  }
});

//Throwing an error will call this function through catch block
function errorHandler(error: unknown, req: IncomingMessage, res: http.ServerResponse) {
  if(error instanceof Error) {
    const errMsg: string = `Bad request ${error.message}`
    res.writeHead(400, { 
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(errMsg),
    }).write(errMsg);
  } else {
    const errMsg: string = "Something went wrong";
    res.writeHead(400, {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(errMsg),
    }).write(errMsg);
  }
  res.end();
}

server.listen(PORT, 'localhost');

server.on('listening',()=> {
  console.log(`listening to port ${PORT}`);
});

server.on('error', (error) => {
  console.log(error.message);
  console.log("Retrying...");
  setTimeout(() => {
    server.close();
    server.listen(PORT, 'localhost');
  }, 1000);
});
