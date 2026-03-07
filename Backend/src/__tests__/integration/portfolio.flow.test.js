const request = require('supertest');
const app = require('../../app');
const { query } = require('../../config/db');
const jwt = require('jsonwebtoken');

// Mock Database
jest.mock('../../config/db', () => ({ query: jest.fn() }));

describe('Portfolio Flow Integration Tests', () => {

    const validToken = jwt.sign({ userId: 1, email: 'user@test.com' }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/portfolio/analytics', () => {
        it('should return 401 if unauthorized', async () => {
            const res = await request(app).get('/api/portfolio/analytics');
            expect(res.status).toBe(401);
        });

        it('should return portfolio breakdown and analytics successfully', async () => {
            // Mock empty portfolio logic for simplicity in integration test
            query.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .get('/api/portfolio/analytics')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.analytics).toBeDefined();
            expect(res.body.analytics.currentValue).toBe(0);
            expect(res.body.analytics.investedValue).toBe(0);
        });
    });

    describe('GET /api/portfolio/history', () => {
        it('should fetch portfolio tracking history', async () => {
            query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    user_id: 1,
                    total_value: "15000.50",
                    invested_amount: "10000.00",
                    recorded_at: new Date()
                }]
            });

            const res = await request(app)
                .get('/api/portfolio/history')
                .set('Authorization', `Bearer ${validToken}`)
                .query({ tf: '1M' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.history.length).toBe(1);
            expect(res.body.history[0].total_value).toBe("15000.50");
        });
    });
});
