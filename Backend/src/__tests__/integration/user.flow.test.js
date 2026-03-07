const request = require('supertest');
const app = require('../../app');
const { query } = require('../../config/db');
const jwt = require('jsonwebtoken');

// Mock Database
jest.mock('../../config/db', () => ({ query: jest.fn() }));

describe('User Flow Integration Tests', () => {

    const validToken = jwt.sign({ userId: 1, email: 'user@test.com' }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/user/profile', () => {
        it('should return user profile if token is valid', async () => {
            query.mockResolvedValueOnce({
                rows: [{ id: 1, username: 'tester', email: 'user@test.com', full_name: 'Test O', role: 'user', created_at: new Date() }]
            });

            const res = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.username).toBe('tester');
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/user/profile');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('No authentication token provided');
        });
    });

    describe('PUT /api/user/profile', () => {
        it('should update user profile successfully', async () => {
            // Mock returning the existing/updated user
            query.mockResolvedValueOnce({
                rows: [{ id: 1, full_name: 'Updated Name', phone: '9999999999' }]
            });

            const res = await request(app)
                .put('/api/user/profile')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    fullName: 'Updated Name',
                    phone: '9999999999'
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Profile updated successfully');
            expect(res.body.user.full_name).toBe('Updated Name');
        });
    });
});
