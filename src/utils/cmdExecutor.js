const { exec } = require('child_process');

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`执行命令时出错: ${error.message}`));
                return;
            }
            if (stderr) {
                reject(new Error(`命令执行过程中产生错误: ${stderr}`));
                return;
            }
            resolve(stdout);
        });
    });
}

function filterAndExecuteCommands(content) {
    const cmdRegex = /```cmd:\s*(.*)```/g;
    const matches = [];
    let match;
    while ((match = cmdRegex.exec(content)) !== null) {
        matches.push(match[1]);
    }

    const executionPromises = matches.map(command => executeCommand(command));
    return Promise.all(executionPromises);
}

module.exports = {
    filterAndExecuteCommands
};