// src/routes/index.js
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { DeepSeekApi } = require('../utils/deepseekAPI');
const { processCodeBlocks } = require('../utils/cmdExecutor');
const { monitorAndFeedback } = require('../utils/programMonitor'); // 引入新功能

// 模拟聊天数据
let chatHistory = [
    {
        id: 1,
        role: 'assistant',
        content: '```javascript\n// 示例代码\nconst message = "Hello, World!";\nconsole.log(message);\n```',
        timestamp: new Date().toISOString()
    }
];

// GET 根路由
router.get('/', (req, res) => {
    res.render('chat');
});

router.post('/api/send', async (req, res) => {
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
        let aiResponse;
        if(process.env.AI_MOCK==="MOCK"){
            // 模拟响应需保持与实际API相同的结构
            aiResponse = {
                reply: (await import('../../__tests__/mockResponse.js')).default
            };
        }else{
            aiResponse = await DeepSeekApi(message, chatHistory);
        }
        

        // 创建 AI 消息对象
        const assistantMessage = {
            id: chatHistory.length + 2,
            role: 'assistant',
            content: aiResponse.reply,
            timestamp: new Date().toISOString()
        };

        // 提取所有代码块
        const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
        let matches;
        const codeBlocks = [];
        while ((matches = codeBlockRegex.exec(aiResponse.reply)) !== null) {
            codeBlocks.push(matches[2]);
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
  
        // 处理代码块
        let result;
        if (codeBlocks.length > 0) {
            result = await processCodeBlocks(codeBlocks);
        }

        // 获取启动脚本

        await monitorAndFeedback(result.packageJsonPath);
        



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
        const { message, chatHistory = [] } = req.body; // 接收对话历史
        const result = await DeepSeekApi(message, chatHistory);
        res.json(result);
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error('Chat Error:', errorMessage);
        res.status(500).json({
            error: '对话服务暂不可用',
            details: errorMessage
        });
    }
});

module.exports = router;