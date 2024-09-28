import Keyv from "keyv"
import type { StoredDataNoRaw } from "keyv";
import KeyvRedis from "@keyv/redis"

const keyvRedis = new KeyvRedis('redis://127.0.0.1:6379');
const keyv = new Keyv({ store: keyvRedis });

keyv.on('error', (error: any) => {
  if(error instanceof Error) {
    console.log(error.message);
  } else {
    console.log("Something went wrong");
  }
  keyv.disconnect();
});

keyv.on('disconnect', ()=> {
  console.log("Keyv is Disconnected!");
});

class CacheService {
  async get(key: string): Promise<StoredDataNoRaw<string | undefined>> {
    const value = await keyv.get<string | undefined>(key);
    if(!value) {
      return value;
    }
    const data = JSON.parse(value)
    return data;
  }
  async set(key: string, value: any) {
    const ttl: number = 60 * 60 * 1000;
    await keyv.set(key, value, ttl);
  }
}

export { CacheService };
