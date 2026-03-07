const request = require('supertest');
const app = require('../../app');
const db = require('../../config/db');

describe('User Flow Integration Tests', () => {

    let validToken;
    let userId;

    beforeAll(async () => {
        const testEmail = `user_test_${Date.now()}@test.com`;

        // 1. Register a real user
        await request(app).post('/api/auth/register').send({
            username: `tester_${Date.now()}`,
            email: testEmail,
            password: 'password123',
            fullName: 'Test O',
            phone: `222${Date.now().toString().slice(-7)}`
        });

        // 2. Login to get valid token
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

    describe('GET /api/user/me', () => {
        it('should return user profile if token is valid', async () => {
            const res = await request(app)
                .get('/api/user/me')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.username).toBeDefined();
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/user/me');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Authorization Token Missing');
        });
    });

    describe('POST /api/user/update-user', () => {
        it('should update user profile successfully', async () => {
            const updatedUsername = `updated_${Date.now()}`;
            const res = await request(app)
                .post('/api/user/update-user')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    username: updatedUsername,
                    email: `updated_${Date.now()}@test.com`
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.username).toBe(updatedUsername);
        });
    });
});
