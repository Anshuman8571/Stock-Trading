const request = require('supertest');
const app = require('../../app');
const db = require('../../config/db');
const { handleMarketAgentChat } = require('../../ai/agents/market.agent');

jest.mock('../../ai/agents/market.agent', () => ({
    handleMarketAgentChat: jest.fn()
}));

describe('AI Flow Integration Tests', () => {

    let validToken;
    let userId;

    beforeAll(async () => {
        const testEmail = `ai_test_${Date.now()}@test.com`;

        // 1. Register a real user
        await request(app).post('/api/auth/register').send({
            username: `ai_tester_${Date.now()}`,
            email: testEmail,
            password: 'password123',
            fullName: 'AI Tester',
            phone: `555${Date.now().toString().slice(-7)}`
        });

        // 2. Login
        const loginRes = await request(app).post('/api/auth/login').send({
            email: testEmail,
            password: 'password123'
        });

        validToken = loginRes.body.accessToken;
        userId = loginRes.body.user.id;
    });

    afterAll(async () => {
        if (db.close) await db.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/ai/agent-chat', () => {

        it('should return 401 if token is missing', async () => {
            const res = await request(app)
                .post('/api/ai/agent-chat')
                .send({ query: 'Hello AI' });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Authorization Token Missing');
        });

        it('should pass message to OmniAgent and return the response', async () => {
            // Mock AI Service Response
            handleMarketAgentChat.mockResolvedValueOnce({
                success: true,
                response: 'I am your AI advisor. Your portfolio looks great!',
                agent_steps: 3
            });

            const res = await request(app)
                .post('/api/ai/agent-chat')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ query: 'Hello AI' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.response).toBe('I am your AI advisor. Your portfolio looks great!');

            // Verify our service was called with the correct userId
            expect(handleMarketAgentChat).toHaveBeenCalledWith(userId, 'Hello AI');
        });

        it('should handle AI service failures gracefully', async () => {
            handleMarketAgentChat.mockRejectedValueOnce(new Error('LLM Timeout'));

            const res = await request(app)
                .post('/api/ai/agent-chat')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ query: 'Analyze this complex thing.' });

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Failed to process agent request.');
        });

        it('should return 400 if message is empty', async () => {
            const res = await request(app)
                .post('/api/ai/agent-chat')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ query: '' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('query is required');
        });
    });
});
