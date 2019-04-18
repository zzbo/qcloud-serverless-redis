const redis = require("redis");
const { promisify } = require("util");
const noop = () => {};

const redisConnect = redisConfig => {
  return new Promise((resolve, reject) => {
    const {
      instanceid,
      pwd,
      onReady = noop,
      onError = noop,
      onEnd = noop
    } = redisConfig;
    // 连接Redis
    const client = redis.createClient(redisConfig);

    console.log("redis init");
    client.on("ready", () => {
      console.log("redis ready.");
      resolve(client);
      onReady();
    });

    // Redis连接错误
    client.on("error", error => {
      console.log("redis error", error);
      reject(error);
      onError();
    });

    client.on("end", () => {
      console.log("redis end");
      onEnd();
    });

    // 腾讯云鉴权
    if (instanceid && pwd) {
      client.auth(`${instanceid}:${pwd}`);
    }
  });
};

const init = config => {
  let redisConnector;
  const redisConfig = {
    host: "127.0.0.1",
    port: "6379",
    connect_timeout: 3000,
    detect_buffers: true,
    onEnd: () => {
      // redis 结束后重连
      redisConnector = redisConnect(redisConfig);
    },
    ...config
  };
  redisConnector = redisConnect(redisConfig);

  return {
    set: (key, value) => {
      return new Promise((resolve, reject) => {
        redisConnector
          .then(client => {
            const set = promisify(client.set).bind(client);
            return set(key, value);
          })
          .then(() => {
            resolve();
          })
          .catch(e => {
            reject(e);
          });
      });
    },
    get: key => {
      return new Promise((resolve, reject) => {
        redisConnector
          .then(client => {
            const get = promisify(client.get).bind(client);
            return get(key);
          })
          .then(value => {
            resolve(value);
          })
          .catch(e => {
            reject(e);
          });
      });
    }
  };
};

module.exports = init;
