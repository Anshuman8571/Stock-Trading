const request = require('supertest');
const app = require('../../app');
const db = require('../../config/db');

describe('User Flow Integration Tests', () => {

    let validToken;
    let userId;

    beforeAll(async () => {
        const testEmail = `user_tester@test.com`;

        // 1. Register a real user
        await request(app).post('/api/auth/register').send({
            username: `user_tester`,
            email: testEmail,
            password: 'password123',
            fullName: 'Test O',
            phone: `2220000006`
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
        if (validToken) {
            await request(app).delete('/api/user/me').set('Authorization', `Bearer ${validToken}`);
        }
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
            const updatedUsername = `updated_user`;
            const res = await request(app)
                .post('/api/user/update-user')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    username: updatedUsername,
                    email: `updated_user@test.com`
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.username).toBe(updatedUsername);
        });
    });
});
