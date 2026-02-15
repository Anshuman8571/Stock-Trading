const authService = require("../../modules/auth/auth.service");
const db = require("../../config/db");
const bcrypt = require("bcrypt");
const tokenUtils = require("../../utils/token");

// Mock dependencies
jest.mock("../../config/db");
jest.mock("bcrypt");
jest.mock("../../utils/token");

describe("Auth Service Unit Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("registerUser", () => {
        it("should register a new user successfully", async () => {
            const mockUser = {
                email: "test@example.com",
                password: "password123",
                username: "testuser",
                fullName: "Test User",
                phone: "1234567890"
            };
            const hashedPassword = "hashedPassword";
            // Service expects DB to return the ID upon insert if using RETURNING, 
            // but your service implementation generates UUID before insert.
            // We just need to ensure no error is thrown.

            db.query.mockResolvedValueOnce({ rows: [] }); // Check existing user
            bcrypt.hash.mockResolvedValue(hashedPassword);
            db.query.mockResolvedValueOnce({ rows: [] }); // Insert execution
            
            const result = await authService.registerUser(mockUser);

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10);
            
            // FIX: Expect user details, not tokens
            expect(result).toHaveProperty("email", mockUser.email);
            expect(result).toHaveProperty("username", mockUser.username);
            expect(result).toHaveProperty("userId");
        });

        it("should throw error if user already exists", async () => {
            const mockUser = { email: "existing@example.com" };
            db.query.mockResolvedValueOnce({ rows: [mockUser] });

            await expect(authService.registerUser(mockUser)).rejects.toThrow("User already exists");
        });
    });

    describe("loginUser", () => {
        it("should login user with correct credentials", async () => {
            const mockUser = { id: "user-id", email: "test@example.com", password: "hashedPassword" };
            const loginData = { email: "test@example.com", password: "password123" };

            db.query.mockResolvedValueOnce({ rows: [mockUser] });
            bcrypt.compare.mockResolvedValue(true);
            tokenUtils.generateAccessToken.mockReturnValue("access-token");
            tokenUtils.generateRefreshToken.mockReturnValue("refresh-token");

            const result = await authService.loginUser(loginData.email, loginData.password); // Fix: Pass arguments individually

            expect(result).toHaveProperty("accessToken", "access-token");
        });

        it("should throw error for invalid credentials", async () => {
            db.query.mockResolvedValueOnce({ rows: [] }); // User not found

            // FIX: Expect the specific error thrown by service for non-existent user
            await expect(authService.loginUser("wrong@example.com", "password"))
                .rejects.toThrow("User does not exist. Please register.");
        });
    });
});