import https from "https"

function requestServer(pathname: string): Promise<string> {
  return new Promise((resolve, reject)=> {
    const httpReq = https.request(`https://jsonplaceholder.typicode.com${pathname}`, (httpRes) => {
      let body: string = "";
      httpRes.on('data', (chunk: Buffer) => {
        body += chunk.toString('utf8');
      });
      httpRes.on('end', ()=> {
        resolve(JSON.stringify(body));
      });
      httpRes.on('error', (error)=> {
        console.log(`Client error ${error.message}`);
        reject(error.message);
      });
    });
    httpReq.setTimeout(2000, ()=> {
      httpReq.emit('error', new Error("Request timed out!"));
    });
    httpReq.on('error', (error)=> {
      console.log(error.message);
      reject(error.message);
    });
    httpReq.end();
  }); 
}

export { requestServer };
