require('dotenv').config();
const axios = require('axios');

// 配置 DeepSeek API 信息
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

async function DeepSeekApi(message, chatHistory){
    try {
        // const { message, chatHistory = [] } = req.body; // 接收对话历史
        if (!message) {
            throw new Error('Message is required');
        }

        // 1. 定义系统角色设定
        const systemContent = `
      你是一名资深全栈程序员，精通 JavaScript,语言。 NodeJs Express框架。
      请遵守以下规则：
      1. 用中文回复，代码用英文
      2. 优先给出简洁代码示例
      我在 Windows 命令提示符里运行命令，在我的项目文件夹的autoCode子文件夹下创建项目代码.用于提取文本中 cmd: 后面的代码。示例请用这种格式：plaintext cmd: [具体命令1] /n cmd:[具体命令2]  别给多余的回复。
      提醒：1. 最外层的双引号将整个 HTML 内容括起来，确保 echo 命令把它当作一个整体输出。
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