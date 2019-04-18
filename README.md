# qcloud-serverless-redis

一个可以在腾讯云 serverless 中稳定运行的 redis 工具库（目前只有 set 和 get 方法）

## Install

```
npm install qcloud-serverless-redis
```

## Usage

```js
"use strict";

const redis = require("qcloud-serverless-redis");
const client = redis({
  host: "10.0.0.2",
  instanceid: "crs-123456",
  pwd: "yourpassword"
});

exports.main_handler = async (event, context, callback) => {
  console.log("%j", event);

  await client.set("abc", "123");
  const getRedisResult = await client.get("abc");

  return getRedisResult;
};
```

如果有更好的想法可以提 issue
