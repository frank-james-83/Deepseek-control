const express = require('express');
const router = express.Router();
const axios = require('axios');
const { exec } = require('child_process'); // 注意：此段代码在当前逻辑中未使用，可根据需要移除

// const { formatContent } = require('../utils/contentFormatter');
const { DeepSeekApi } = require('../utils/deepseekAPI') ;
const { filterAndExecuteCommands } = require('../utils/cmdExecutor');

// 模拟聊天数据
let chatHistory = [
    {
        id: 1,
        role: 'assistant',
        content: '```cmd: dir\n cmd: tree /F | findstr /V /I /C:"node_modules" /C:".git" cmd: echo <html><body><h1>Example create HTML FILE Hello World</h1></body></html> > hello_world.html```',
        timestamp: new Date().toISOString()
    }
];

// GET 根路由
router.get('/', (req, res) => {
    res.render('chat');
});



router.post('/api/send', async (req, res) => { // 添加 async 关键字
    try {
        const { message } = req.body;

        // 参数验证
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Invalid message format'
            });
        }

        // 创建用户消息对象
        const userMessage = {
            id: chatHistory.length + 1,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        // 调用 DeepSeek API
        const aiResponse = await DeepSeekApi(message, chatHistory);

        // 创建 AI 消息对象
        const assistantMessage = {
            id: chatHistory.length + 2,
            role: 'assistant',
            content: aiResponse.reply,
            timestamp: new Date().toISOString()
        };

        // 过滤出 cmd 命令行的程序并执行
        try {
            const results = await filterAndExecuteCommands(assistantMessage.content);
            results.forEach((result, index) => {
                console.log(`第 ${index + 1} 条命令执行结果:\n${result}`);
            });
        } catch (error) {
            console.error(error.message);
        }

        // 更新对话历史（同时保存用户和 AI 的消息）
        chatHistory.push(userMessage, assistantMessage);

        // 返回完整对话数据
        res.json({
            status: 'success',
            messages: {
                user: userMessage,
                assistant: assistantMessage
            },
            chatHistory: chatHistory.slice(-10) // 返回最近10条记录
        });

    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({
            error: '请求处理失败',
            details: error.message,
            errorCode: 'DEEPSEEK_API_ERROR'
        });
    }
});



// POST 与 DeepSeek 聊天路由
router.post('/chat', async (req, res) => {
    

    try {
        // ... 处理与 DeepSeek 聊天逻辑
        const { message, chatHistory = [] } = req.body; // 接收对话历史
        const result = await DeepSeekApi(message, chatHistory)
        res.json(result);
        
    } catch (error) {
        // 增强错误处理（同时发送到 HTTP 和 WebSocket）
        const errorMessage = error.response?.data?.error || error.message;
        console.error('Chat Error:', errorMessage);

        // 返回 HTTP 错误响应
        res.status(500).json({
            error: '对话服务暂不可用',
            details: errorMessage
        });
    }
});

module.exports = router;
