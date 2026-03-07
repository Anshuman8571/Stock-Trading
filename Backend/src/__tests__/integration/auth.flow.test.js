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
    const testEmail1 = `new_${Date.now()}@test.com`;
    const existEmail = `exist_${Date.now()}@test.com`;
    const validEmail = `valid_${Date.now()}@test.com`;

    beforeAll(async () => {
        // Pre-create the user that we expect to "already exist" and standard valid user
        await request(app).post('/api/auth/register').send({
            username: `existuser_${Date.now()}`,
            email: existEmail,
            password: 'password123',
            fullName: 'Exist User',
            phone: `123${Date.now().toString().slice(-7)}`
        });

        await request(app).post('/api/auth/register').send({
            username: `validuser_${Date.now()}`,
            email: validEmail,
            password: 'password123',
            fullName: 'Valid User',
            phone: `098${Date.now().toString().slice(-7)}`
        });
    });

    afterAll(async () => {
        if (db.close) await db.close();
    });

    describe('POST /api/auth/register', () => {
        it('should successfully register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: `testuser_${Date.now()}`,
                    email: testEmail1,
                    password: 'password123',
                    fullName: 'Test User',
                    phone: `456${Date.now().toString().slice(-7)}`
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Registration successful');
        });

        it('should return 400 if user already exists', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: `existuser2_${Date.now()}`, // Try exact email collision
                    email: existEmail,
                    password: 'password123',
                    fullName: 'Exist User',
                    phone: `789${Date.now().toString().slice(-7)}`
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
