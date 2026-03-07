const request = require('supertest');
const app = require('../../app');
const { query } = require('../../config/db');
const jwt = require('jsonwebtoken');
const { getOmniAgentResponse } = require('../../ai/services/ai.service');

// Mock dependencies
jest.mock('../../config/db', () => ({ query: jest.fn() }));
jest.mock('../../ai/services/ai.service', () => ({
    getOmniAgentResponse: jest.fn()
}));

describe('AI Flow Integration Tests', () => {

    const validToken = jwt.sign({ userId: 1, email: 'user@test.com' }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/ai/agent-chat', () => {

        it('should return 401 if token is missing', async () => {
            const res = await request(app)
                .post('/api/ai/agent-chat')
                .send({ message: 'Hello AI' });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('No authentication token provided');
        });

        it('should pass message to OmniAgent and return the response', async () => {
            // Mock AI Service Response
            getOmniAgentResponse.mockResolvedValueOnce({
                success: true,
                response: 'I am your AI advisor. Your portfolio looks great!',
                context: { testContext: true }
            });

            const res = await request(app)
                .post('/api/ai/agent-chat')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ message: 'Hello AI' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.response).toBe('I am your AI advisor. Your portfolio looks great!');

            // Verify our service was called with the decoded userId
            expect(getOmniAgentResponse).toHaveBeenCalledWith(1, 'Hello AI');
        });

        it('should handle AI service failures gracefully', async () => {
            getOmniAgentResponse.mockRejectedValueOnce(new Error('LLM Timeout'));

            const res = await request(app)
                .post('/api/ai/agent-chat')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ message: 'Analyze this complex thing.' });

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('LLM Timeout');
        });

        it('should return 400 if message is empty', async () => {
            const res = await request(app)
                .post('/api/ai/agent-chat')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ message: '' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Message is required.');
        });
    });
});
