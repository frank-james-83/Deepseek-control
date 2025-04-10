const express = require('express');
const app = express();

// 定义一个简单的路由
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// 启动服务器，监听 3000 端口
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});