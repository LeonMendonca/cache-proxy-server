##### Installation
- Run `npm install` or any package manager you'd prefer
- [Install Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)
##### Run the proxy-server
```bash
npx tsx src/cache-server.ts
```
![listener image](images/listenerlog.png)
> **There shouldn't be any error messages, but if it does, it means that it couldn't connect to redis.**
##### Requesting the Cache-Server
- This cache-server servers the response from a fake JSON API. **Documentation [here](https://jsonplaceholder.typicode.com/)**
- Just append the API path/endpoint with the cache-server' base URL 

> Example:
```javascript
https://jsonplaceholder.typicode.com/todos/1
``` 
```javascript
http://localhost:2900/todos/1
```
