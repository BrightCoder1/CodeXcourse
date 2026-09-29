const dotenv = require("dotenv")
dotenv.config()


const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const connectDB = require('./src/config/db.config.js')

const PORT = process.env.PORT || 5000;

connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

