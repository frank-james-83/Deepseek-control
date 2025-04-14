const puppeteer = require('puppeteer');

async function getLogsWithPuppeteer(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    url = 'file:///C:/Users/Administrator/Documents/Nodejs/vscode/server_deepseek/src/autoCode/multiplication-table/index.html'
    // 启用 CDP 会话
    const client = await page.target().createCDPSession();
    await client.send('Log.enable');

    const logs = [];

    // 监听日志事件
    client.on('Log.entryAdded', (entry) => {
        logs.push(entry.text);
    });

    try {
        await page.goto(url);
        await new Promise(resolve => setTimeout(resolve, 5000)); // 等待一段时间以收集日志
    } catch (error) {
        console.error('Error navigating to page:', error);
    } finally {
        await browser.close();
    }

    return logs;
}

module.exports = getLogsWithPuppeteer;    