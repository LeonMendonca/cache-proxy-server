import http, { IncomingMessage, ServerResponse } from "http"
import { URL } from "url";
import { CacheService } from "./keyv-redis";
import { requestServer } from "./httpReq";

const PORT: number = 2900;
const baseUrl = `http://localhost:${PORT}`

const server = http.createServer();

const cacheService = new CacheService();

server.on('request', async (req, res)=> {
  let response = "";
  try {
    if(!req.url) { 
      throw new Error("No URL"); 
    }
    const url = new URL(`${baseUrl}${req.url}`);
    const value = await cacheService.get(url.pathname);
    if(value) {
      response = value;
      res.setHeader("X-Cache", 'hit');
    } else {
      const rawData = await requestServer(url.pathname);
      response = await JSON.parse(rawData);
      res.setHeader("X-Cache", 'miss'); 
      await cacheService.set(url.pathname, rawData);
    }
    res.writeHead(200, "OK", {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(response),
    });
    res.write(response);
    res.end();
  } catch (error) {
    errorHandler(error, req, res);
  }
});

//Throwing an error will call this function through catch block
function errorHandler(error: unknown, req: IncomingMessage, res: ServerResponse) {
  let errMsg: string = "";
  if(error instanceof Error) {
    errMsg = `Bad request ${error.message}`
  } else {
    errMsg = "Something went wrong";
  }
  res.writeHead(400, { 
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(errMsg),
    }).write(errMsg);
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
