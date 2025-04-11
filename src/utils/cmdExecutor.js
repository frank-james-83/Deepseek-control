const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 辅助函数：将代码块转换为 cmd 命令
function convertCodeToCmd(code, language) {
    if (language === 'javascript') {
        // 假设使用 Node.js 执行 JavaScript 代码
        // 先将代码保存到临时文件
        const tempFilePath = path.join(__dirname, '..', 'autoCode', 'temp.js');
        fs.writeFileSync(tempFilePath, code);
        return `node ${tempFilePath}`;
    }
    // 可以根据需要添加更多语言的处理逻辑
    return null;
}

// 执行命令的函数
async function executeCmd(cmdCommand) {
    if (cmdCommand) {
        try {
            const { stdout, stderr } = await new Promise((resolve, reject) => {
                exec(cmdCommand, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({ stdout, stderr });
                    }
                });
            });
            if (stderr) {
                console.error('命令执行错误:', stderr);
            } else {
                console.log('命令执行结果:', stdout);
            }
        } catch (error) {
            console.error('执行命令时出错:', error.message);
        }
    }
}

module.exports = {
    convertCodeToCmd,
    executeCmd
};    