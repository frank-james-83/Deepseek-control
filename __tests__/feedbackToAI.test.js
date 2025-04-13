// __tests__/feedbackToAI.test.js
const { feedbackToAI } = require('../yourModule');
const mockResponse = require('./mockResponse');

// 模拟 DeepSeekApi 函数
jest.mock('../deepseekAPI', () => {
    return {
        DeepSeekApi: jest.fn().mockResolvedValue({
            reply: mockResponse,
            chatHistory: []
        })
    };
});

describe('feedbackToAI', () => {
    it('should return AI reply without waiting for code block processing', async () => {
        const issueMessage = '程序运行出错';
        const aiReply = await feedbackToAI(issueMessage);
        expect(aiReply).toBe(mockResponse);
    });
});