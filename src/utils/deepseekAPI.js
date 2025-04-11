require('dotenv').config();
const axios = require('axios');

// 配置 DeepSeek API 信息
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

async function DeepSeekApi(message, chatHistory) {
    try {
        // const { message, chatHistory = [] } = req.body; // 接收对话历史
        if (!message) {
            throw new Error('Message is required');
        }

        // 1. 定义系统角色设定
        const systemContent = `
你是一名资深全栈程序员，精通 JavaScript 语言和 NodeJs Express 框架。
请严格遵守以下规则：
1. 用中文回复，代码用英文。
2. 优先给出简洁代码示例,必须以双斜杠注释的方式写在代码块的第一行。
3. 多文件项目提供每个文件的目录 
5. 必须把所有生成的程序放在"./autoCode/projectName"子文件夹下。
6. 必须生成package.json,并指定scripts.start 为"node xxx.js"

// 定义不同文件类型对应的注释符号
const commentSymbols = {
    'javascript': { start: '//', end: null },
    'css': { start: '/*', end: '*/' },
    'html': { start: '<!--', end: '-->' },
    'python': { start: '#', end: null },
    // 可根据需要添加更多文件类型的注释符号
};

示例：
javascript
// ./autoCode/simple-website/public/js/script.js
 console.log("this is an example");     
});
`;

        // 2. 构建带上下文的对话历史
        const messages = [
            { role: "system", content: systemContent },  // 系统角色设定
            ...chatHistory,                              // 历史对话上下文
            { role: "user", content: message }           // 新用户消息
        ];

        // 3. 构建符合 DeepSeek 要求的请求体
        const requestBody = {
            model: "deepseek-chat",
            messages: messages,
            temperature: 0.3,     // 降低随机性以提高代码准确性
            max_tokens: 2048,
            top_p: 0.95
        };

        // 4. 发送 API 请求
        const response = await axios.post(
            "https://api.deepseek.com/v1/chat/completions",
            requestBody,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
                }
            }
        );

        // 5. 解析响应并更新对话历史
        const aiReply = response.data.choices[0].message.content;
        const updatedHistory = [
            ...messages.slice(1), // 排除 system 消息
            { role: "assistant", content: aiReply }
        ];

        return {
            reply: aiReply,
            chatHistory: updatedHistory // 返回更新后的对话上下文
        };

    } catch (error) {
        // 增强错误处理
        const errorDetails = {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        };
        console.error('API Error:', errorDetails);
        throw new Error('对话服务暂不可用: ' + (error.response?.data?.error || error.message));
    }
}

module.exports = {
    DeepSeekApi
};