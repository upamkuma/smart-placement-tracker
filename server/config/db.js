const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
  try {
    const uri = "mongodb+srv://upamkumar096_db_user:Ad4zBajwY8xqsgKP@cluster0.4xwcezi.mongodb.net/royDB";
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
