const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { readFileSync } = require('fs');
const os = require('os');

// 定义不同文件类型对应的注释符号
const commentSymbols = {
    'javascript': { start: '//', end: null },
    'css': { start: '/*', end: '*/' },
    'html': { start: '<!--', end: '-->' },
    'python': { start: '#', end: null },
    // 可根据需要添加更多文件类型的注释符号
};

let packageJsonPath = null;



// 辅助函数：根据代码第一行注释创建文件
function createFilesFromCode(codeBlocks) {
    const creationPromises = codeBlocks.map(codeBlock => {
        return new Promise((resolve, reject) => {
            const lines = codeBlock.split('\n');
            const firstLine = lines[0].trim();
            console.log('正在处理代码块，第一行内容:', firstLine);

            let filePath = null;
            let fileType = null;
            // 遍历注释符号映射，检查第一行是否符合某种注释规则
            for (const [type, { start, end }] of Object.entries(commentSymbols)) {
                if (firstLine.startsWith(start)) {
                    if (end) {
                        const endIndex = firstLine.indexOf(end);
                        if (endIndex !== -1) {
                            filePath = firstLine.slice(start.length, endIndex).trim();
                            fileType = type;
                            break;
                        }
                    } else {
                        filePath = firstLine.slice(start.length).trim();
                        fileType = type;
                        break;
                    }
                }
            }

            if (filePath) {
                const fullPath = path.join(__dirname, '..', filePath);
                const code = lines.slice(1).join('\n');

                console.log('解析到的文件路径:', fullPath);

                const dir = path.dirname(fullPath);
                // 检查目录是否存在
                if (!fs.existsSync(dir)) {
                    try {
                        fs.mkdirSync(dir, { recursive: true });
                        console.log('成功创建目录:', dir);
                    } catch (mkdirError) {
                        console.error('创建目录时出错:', mkdirError.message);
                        reject(new Error(`创建目录 ${dir} 时出错: ${mkdirError.message}`));
                        return;
                    }
                }

                // 获取生成项目的项目目录
                if (filePath.includes('package.json')) {
                    packageJsonPath = path.join(__dirname, '..', filePath);
                }

                // 检查文件是否存在，存在则更新
                if (fs.existsSync(fullPath)) {
                    console.log('文件已存在，更新文件内容:', fullPath);
                }

                fs.writeFile(fullPath, code, (err) => {
                    if (err) {
                        console.error('写入文件时出错:', err.message);
                        reject(new Error(`创建文件 ${fullPath} 时出错: ${err.message}`));
                    } else {
                        console.log('成功写入文件:', fullPath);
                        resolve(fullPath);
                    }
                });
            } else {
                console.error('代码块第一行不是有效的文件路径注释:', firstLine);
                reject(new Error('代码块第一行不是有效的文件路径注释'));
            }
        });
    });

    return Promise.all(creationPromises);
}



// 主函数：处理代码块，创建文件并执行启动脚本
async function processCodeBlocks(codeBlocks) {
    try {
        await createFilesFromCode(codeBlocks);
        return { packageJsonPath };
    } catch (error) {
        console.error('处理代码块时出错:', error.message);
        return { packageJsonPath: null };
    }
}

module.exports = {
    processCodeBlocks
};