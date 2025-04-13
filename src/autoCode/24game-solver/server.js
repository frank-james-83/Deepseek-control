const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoint to solve 24 game
app.post('/solve', (req, res) => {
    const { numbers } = req.body;
    if (!numbers || numbers.length !== 4) {
        return res.status(400).json({ error: 'Please provide exactly 4 numbers' });
    }

    const solutions = solve24(numbers);
    res.json({ solutions });
});

// 24-point game solver algorithm
function solve24(numbers) {
    const solutions = new Set();
    const ops = ['+', '-', '*', '/'];
    
    // Generate all permutations of the 4 numbers
    const permutations = permute(numbers);
    
    // Try all combinations of operations and parentheses
    for (const nums of permutations) {
        for (const op1 of ops) {
            for (const op2 of ops) {
                for (const op3 of ops) {
                    // Try different parenthesizations
                    const expressions = [
                        `(${nums[0]}${op1}${nums[1]})${op2}(${nums[2]}${op3}${nums[3]})`,
                        `((${nums[0]}${op1}${nums[1]})${op2}${nums[2]})${op3}${nums[3]}`,
                        `${nums[0]}${op1}(${nums[1]}${op2}(${nums[2]}${op3}${nums[3]}))`,
                        `${nums[0]}${op1}((${nums[1]}${op2}${nums[2]})${op3}${nums[3]})`,
                        `(${nums[0]}${op1}(${nums[1]}${op2}${nums[2]}))${op3}${nums[3]}`
                    ];
                    
                    for (const expr of expressions) {
                        try {
                            const result = eval(expr);
                            if (Math.abs(result - 24) < 0.0001) { // Account for floating point errors
                                solutions.add(expr.replace(/(\d+)/g, (match) => {
                                    const num = parseInt(match);
                                    return num > 10 ? ['J','Q','K','小王','大王'][num-11] || num : num;
                                }));
                            }
                        } catch (e) {
                            // Ignore division by zero errors
                        }
                    }
                }
            }
        }
    }
    
    return Array.from(solutions);
}

// Helper function to generate all permutations of an array
function permute(arr) {
    const result = [];
    if (arr.length === 1) return [arr];
    
    for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
        const remainingPerms = permute(remaining);
        
        for (const perm of remainingPerms) {
            result.push([current, ...perm]);
        }
    }
    
    return result;
}

app.listen(port, () => {
    console.log(`24 Game Solver running at http://localhost:${port}`);
});
