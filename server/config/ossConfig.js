const OSS = require('ali-oss');
require('dotenv').config();

const client = new OSS({
  region: process.env.OSS_REGION,
  endpoint: process.env.OSS_ENDPOINT,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET
});

module.exports = client;