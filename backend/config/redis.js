//Imports
import { Redis } from "@upstash/redis";
//Lazy singleton — client is created on first use, after dotenv has loaded
let _client = null;
const getClient = () => {
  if (!_client) {
    _client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _client;
};
//Proxy so all callers can keep using `redis.get(...)`, `redis.set(...)` etc.
const redis = new Proxy(
  {},
  {
    get(_, prop) {
      return (...args) => getClient()[prop](...args);
    },
  },
);
//Export
export default redis;
