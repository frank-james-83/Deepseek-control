document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('multiplication-table');
    console.error("this is a log from generated application");
    // 创建表头
    for (let i = 0; i <= 9; i++) {
        const headerCell = document.createElement('div');
        headerCell.className = 'cell header';
        headerCell.textContent = i === 0 ? '×' : i;
        table.appendChild(headerCell);
    }
    
    // 创建乘法表内容
    for (let i = 1; i <= 9; i++) {
        // 行头
        const rowHeader = document.createElement('div');
        rowHeader.className = 'cell header';
        rowHeader.textContent = i;
        table.appendChild(rowHeader);
        
        // 行内容
        for (let j = 1; j <= 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = i * j;
            table.appendChild(cell);
        }
    }
});
