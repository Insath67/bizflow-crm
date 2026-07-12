const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

let cached = global.bizflowMongoose;

if (!cached) {
  cached = global.bizflowMongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
      });
    }

    cached.conn = await cached.promise;

    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);

    return cached.conn;
  } catch (error) {
    cached.promise = null;

    console.error(`MongoDB Connection Error: ${error.message}`);

    if (!process.env.VERCEL) {
      process.exit(1);
    }

    throw error;
  }
};

module.exports = connectDB;