const request = require('supertest');
const app = require('../../app');
const db = require('../../config/db');

// Mock Google Auth bypass
jest.mock('google-auth-library', () => {
    return {
        OAuth2Client: jest.fn().mockImplementation(() => ({
            verifyIdToken: jest.fn().mockResolvedValue({
                getPayload: () => ({ email: `google_${Date.now()}@google.com`, name: 'Test Google User', sub: `sub_${Date.now()}` })
            })
        }))
    }
});

describe('Authentication Flow Integration Tests', () => {

    // We will use standard real DB integration tests
    const testEmail1 = `new_auth@test.com`;
    const existEmail = `exist_auth@test.com`;
    const validEmail = `valid_auth@test.com`;

    beforeAll(async () => {
        // Pre-create the user that we expect to "already exist" and standard valid user
        await request(app).post('/api/auth/register').send({
            username: `existuser`,
            email: existEmail,
            password: 'password123',
            fullName: 'Exist User',
            phone: `1230000008`
        });

        await request(app).post('/api/auth/register').send({
            username: `validuser`,
            email: validEmail,
            password: 'password123',
            fullName: 'Valid User',
            phone: `0980000009`
        });
    });

    afterAll(async () => {
        try {
            const client = await db.getClient();
            await client.query('DELETE FROM users WHERE email IN ($1, $2, $3)', [testEmail1, existEmail, validEmail]);
            client.release();
        } catch (error) {
            console.error("Cleanup error in auth.flow.test", error);
        }
        if (db.close) await db.close();
    });

    describe('POST /api/auth/register', () => {
        it('should successfully register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: `testuser`,
                    email: testEmail1,
                    password: 'password123',
                    fullName: 'Test User',
                    phone: `4560000010`
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Registration successful');
        });

        it('should return 400 if user already exists', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: `existuser2`, // Try exact email collision
                    email: existEmail,
                    password: 'password123',
                    fullName: 'Exist User',
                    phone: `7890000011`
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('User already exist with this username or email');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should successfully login and return token', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validEmail,
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Login successful.');
            expect(res.body.accessToken).toBeDefined();
        });

        it('should return 401 on invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validEmail,
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid credentials.');
        });
    });
});
