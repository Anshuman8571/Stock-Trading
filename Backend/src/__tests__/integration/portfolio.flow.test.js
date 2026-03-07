const request = require('supertest');
const app = require('../../app');
const db = require('../../config/db');

describe('Portfolio Flow Integration Tests', () => {

    let validToken;
    let userId;

    beforeAll(async () => {
        const testEmail = `port_test_${Date.now()}@test.com`;

        // 1. Register a real user
        await request(app).post('/api/auth/register').send({
            username: `port_tester_${Date.now()}`,
            email: testEmail,
            password: 'password123',
            fullName: 'Portfolio Tester',
            phone: `333${Date.now().toString().slice(-7)}`
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

    describe('GET /api/portfolio/analytics', () => {
        it('should return 401 if unauthorized', async () => {
            const res = await request(app).get('/api/portfolio/analytics');
            expect(res.status).toBe(401);
        });

        it('should return portfolio breakdown and analytics successfully', async () => {
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

    describe('GET /api/portfolio/', () => {
        it('should fetch portfolio holdings correctly', async () => {
            const res = await request(app)
                .get('/api/portfolio/')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.holdings).toBeDefined();
            expect(Array.isArray(res.body.holdings)).toBe(true);
        });
    });
});
