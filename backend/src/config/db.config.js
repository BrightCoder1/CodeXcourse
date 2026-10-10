const mongoose = require('mongoose');

const URL = process.env.MONGO_URI || 'mongodb://localhost:27017/codexcourse';

const connectDB = async () => {
    try{
        await mongoose.connect(URL)
        console.log("Database connection DONE....")
    }catch (error) {
        return console.error(`Error: ${error.message}`);
    }
}

module.exports = connectDB;

