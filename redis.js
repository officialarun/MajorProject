const redis = require("redis");

// Create Redis Client
const client = redis.createClient({
    url: process.env.REDIS_URL, // Use environment variable for deployment
});

client.connect().catch(console.error); // Handle connection errors

module.exports = client;
