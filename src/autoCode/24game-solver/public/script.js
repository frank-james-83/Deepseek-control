document.addEventListener('DOMContentLoaded', () => {
    const solveBtn = document.getElementById('solve-btn');
    const solutionsList = document.getElementById('solutions-list');
    
    solveBtn.addEventListener('click', async () => {
        const num1 = parseInt(document.getElementById('num1').value);
        const num2 = parseInt(document.getElementById('num2').value);
        const num3 = parseInt(document.getElementById('num3').value);
        const num4 = parseInt(document.getElementById('num4').value);
        
        if ([num1, num2, num3, num4].some(isNaN)) {
            alert('请输入有效的数字 (1-15)');
            return;
        }
        
        try {
            const response = await fetch('/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ numbers: [num1, num2, num3, num4] }),
            });
            
            const data = await response.json();
            displaySolutions(data.solutions);
        } catch (error) {
            console.error('Error:', error);
            alert('求解过程中出现错误');
        }
    });
    
    function displaySolutions(solutions) {
        solutionsList.innerHTML = '';
        
        if (solutions.length === 0) {
            solutionsList.innerHTML = '<li>无解</li>';
            return;
        }
        
        solutions.forEach(solution => {
            const li = document.createElement('li');
            li.textContent = solution;
            solutionsList.appendChild(li);
        });
    }
});
