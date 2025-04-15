const { spawn } = require('child_process');
const { DeepSeekApi } = require('./deepseekAPI');
const os = require('os');
const fs = require('fs'); // 引入 fs 模块
const path = require('path'); // 引入 path 模块
const getLogsWithPuppeteer = require('../utils/getLogsWithPuppeteer');
let chatHistory = [];

// 从 package.json 中读取启动脚本
function getStartScript(packageJsonPath) {
    console.log("开始执行getStartScript()");
    if (!packageJsonPath) {
        console.error('未找到 package.json 文件路径');
        return null;
    }
    // 使用 path.normalize 规范化路径
    const normalizedPath = path.normalize(packageJsonPath);
    try {
        const packageJsonContent = fs.readFileSync(normalizedPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);
        const startScript = packageJson.scripts.start;
        if (startScript) {
            const packageJsonDir = path.dirname(normalizedPath);
            const [command, ...args] = startScript.split(' ');
            let finalCommand, finalArgs;
            if (command === 'open') {
                let openCommand;
                if (os.platform() === 'win32') {
                    openCommand = 'start';
                    finalCommand = 'cmd.exe';
                    finalArgs = ['/c', 'start', ...args.map(arg => path.join(packageJsonDir, arg))];
                } else if (os.platform() === 'linux') {
                    openCommand = 'xdg-open';
                    finalCommand = openCommand;
                    finalArgs = args.map(arg => path.join(packageJsonDir, arg));
                } else {
                    openCommand = 'open';
                    finalCommand = openCommand;
                    finalArgs = args.map(arg => path.join(packageJsonDir, arg));
                }
                return { command: finalCommand, args: finalArgs, url: args[0] ? path.join(packageJsonDir, args[0]) : null };
            }
            if (command === 'node') {
                const fullScriptPath = path.join(packageJsonDir, ...args);
                return { command: 'node', args: [fullScriptPath] };
            }
            console.log("startScript is:", startScript);
            return { command, args };
        }
    } catch (error) {
        console.error('读取 package.json 时出错:', error.message);
        return null;
    }
}

// 监控程序运行情况
async function monitorProgram(packageJsonPath) {
    const startScript = getStartScript(packageJsonPath);
    if (!startScript) {
        console.error('未获取到启动脚本');
        return Promise.reject('未获取到启动脚本');
    }
    return new Promise((resolve, reject) => {
        console.log('即将执行启动脚本:', startScript.command, startScript.args);
        const child = spawn(startScript.command,
            startScript.args, {
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'] // 保留stdout和stderr 
        });
        child.unref();
        console.log('启动脚本已在后台执行');

        child.on('close', (code) => {
            if (code !== 0) {
                const exitMessage = `程序异常退出，退出码：${code}`;
                console.error(exitMessage);
                reject(exitMessage);
            } else {
                const successMessage = `程序正常运行结束`;
                console.log(successMessage);
                resolve(successMessage);
            }
        });

        child.on('error', (err) => {
            const errorMessage = `程序启动出错：${err.message}`;
            console.error(errorMessage);
            reject(errorMessage);
        });

        // 监听标准输出
        child.stdout.on('data', async (data) => {
            const output = data.toString();
            console.log('子进程输出:', output);
            // 在这里调用你的 deepseekapi 将 errorOutput 发送给 AI
        });

        // 监听错误输出
        child.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            console.error('子进程错误:', errorOutput);
            // 在这里调用你的 deepseekapi 将Output 发送给 AI
        });

        // 假设程序启动后会打开一个网页，这里可以获取网页日志
        let url;
        // 获取网页日志
        (async () => {
            if (startScript.url) {
                url = startScript.url;
                console.log("监控的网址为：", url);
            } else {
                console.log("监控备用URL")
                url = 'file:///C:/Users/Administrator/Documents/Nodejs/vscode/server_deepseek/src/autoCode/multiplication-table/index.html'; // 作为备用 URL
            }
            const logs = await getLogsWithPuppeteer(url);
            console.log('Puppeteer 获取的日志:', logs);
            // 在这里调用你的 deepseekapi 将 output 发送给 AI
        })();

    });
}

// 反馈问题给 AI 并处理
async function feedbackToAI(issueMessage) {
    try {
        const message = `程序运行出现问题：${issueMessage}，请修改代码解决问题。`;
        const aiResponse = await DeepSeekApi(message, chatHistory);
        chatHistory = aiResponse.chatHistory;

        // 提取代码块
        const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
        let matches;
        const codeBlocks = [];
        while ((matches = codeBlockRegex.exec(aiResponse.reply)) !== null) {
            codeBlocks.push(matches[2]);
        }

        // 不等待代码块处理结果，直接开始处理代码块
        if (codeBlocks.length > 0) {
            processCodeBlocks(codeBlocks).catch((error) => {
                // 处理代码块过程中出现错误时的日志记录
                console.error('处理代码块时出错:', error.message);
            });
        }

        return aiResponse.reply;
    } catch (error) {
        console.error('反馈问题给 AI 时出错:', error.message);
        throw error;
    }
}

// 主函数：监控程序并反馈问题
async function monitorAndFeedback(packageJsonPath) {
    let isSuccess = false;
    let attempts = 0;
    const maxAttempts = 5; // 最大尝试次数

    while (!isSuccess && attempts < maxAttempts) {
        try {
            const result = await monitorProgram(packageJsonPath);
            console.log('程序运行正常:', result);
            isSuccess = true;
        } catch (issue) {
            attempts++;
            console.log(`第 ${attempts} 次尝试解决问题...`);
            const aiReply = await feedbackToAI(issue);
            console.log('AI 回复:', aiReply);
        }
    }

    if (!isSuccess) {
        console.error('达到最大尝试次数，无法解决问题。');
    }
}

module.exports = {
    monitorAndFeedback
};    