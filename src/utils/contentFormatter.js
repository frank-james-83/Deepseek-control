// 多功能内容处理器  contentFormatter.js
function formatContent(content) {
    // 基础安全处理
    // let processed = sanitize(content);

    // 链接自动识别
    processed = content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank">$1</a>'
    );

    // 代码块高亮
    processed = content.replace(
        /```([\s\S]*?)```/g,
        '<pre><code>$1</code></pre>'
    );

    return processed;
}

// 新增模块导出语句
module.exports = {
    formatContent
};