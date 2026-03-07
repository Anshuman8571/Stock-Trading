const request = require('supertest');
const app = require('../../app');
const { query } = require('../../config/db');

// Mock external dependencies & database
jest.mock('../../config/db', () => ({
    query: jest.fn()
}));
jest.mock('google-auth-library', () => {
    return {
        OAuth2Client: jest.fn().mockImplementation(() => ({
            verifyIdToken: jest.fn().mockResolvedValue({
                getPayload: () => ({ email: 'test@google.com', name: 'Test Google User', sub: '12345' })
            })
        }))
    }
});

describe('Authentication Flow Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should successfully register a new user', async () => {
            // Mock DB to simulate user does not exist
            query.mockResolvedValueOnce({ rows: [] });

            // Mock DB for inserting new user
            query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'new@test.com' }] });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'new@test.com',
                    password: 'password123',
                    fullName: 'Test User',
                    phone: '1234567890'
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('User registered successfully');
            expect(query).toHaveBeenCalledTimes(2);
        });

        it('should return 400 if user already exists', async () => {
            // Mock DB to simulate user EXISTS
            query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'exist@test.com' }] });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'existuser',
                    email: 'exist@test.com',
                    password: 'password123',
                    fullName: 'Exist User',
                    phone: '1234567890'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('User already exist with this username or email');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should successfully login and return token', async () => {
            // Mock DB finding user
            query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    email: 'valid@test.com',
                    password_hash: '$2b$10$f02C63HhH/I47f/YtqFk/.5bI.8cI0S6H3H.D.Y/G8Y42H.Y.K33.' // bcrypt hash for 'password123'
                }]
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'valid@test.com',
                    password: 'password123' // plain text matches hash
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Login successful.');
            expect(res.body.token).toBeDefined();
        });

        it('should return 401 on invalid credentials', async () => {
            query.mockResolvedValueOnce({ rows: [] }); // User not found

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid@test.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid credentials.');
        });
    });

    describe('POST /api/auth/google', () => {
        it('should authenticate user and return token via Google OAuth', async () => {
            // Google auth mock setup allows bypass

            // Mock check user exists (say, they don't yet)
            query.mockResolvedValueOnce({ rows: [] });

            // Mock insert user
            query.mockResolvedValueOnce({ rows: [{ id: 2, email: 'test@google.com', username: 'Test Google User' }] });

            const res = await request(app)
                .post('/api/auth/google')
                .send({ token: 'mock-google-token' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Login successful');
            expect(res.body.token).toBeDefined();
        });
    });
});
