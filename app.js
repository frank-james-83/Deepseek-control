
const express = require('express');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);



// 设置模板引擎
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = require('./src/routes/index');
// 使用路由
app.use('/', router);



const port = 3009;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





