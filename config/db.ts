import mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // @ts-ignore
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // @ts-ignore
    console.log(`Error: ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;
