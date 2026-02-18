const walletService = require("../../modules/wallet/wallet.service");
const db = require("../../config/db");
const { redis } = require("../../config/redis");

// Mock dependencies
jest.mock("../../config/db");
jest.mock("../../config/redis", () => ({
    redis: {
        get: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn()
    }
}));

describe("Wallet Service Unit Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initiateDeposit", () => {
        it("should generate OTP and store in Redis", async () => {
            const userId = "user-123";
            const amount = 5000;
            const mockPhone = "9876543210";

            // Mock DB returning user phone
            db.query.mockResolvedValueOnce({ rows: [{ phone: mockPhone }] });

            const result = await walletService.initiateDeposit(userId, amount);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining("SELECT phone FROM users"), [userId]);
            expect(redis.setEx).toHaveBeenCalledWith(
                `deposit_otp:${userId}`,
                300, // Expiry
                expect.stringContaining(amount.toString()) // Payload contains amount
            );
            expect(result).toHaveProperty("message");
        });

        it("should throw error if user has no phone number", async () => {
            db.query.mockResolvedValueOnce({ rows: [] }); // User not found
            await expect(walletService.initiateDeposit("user-123", 100)).rejects.toThrow("User phone number not found");
        });
    });

    describe("verifyDeposit", () => {
        it("should verify OTP and update balance", async () => {
            const userId = "user-123";
            const otp = "123456";
            const amount = 1000;

            // Mock Redis returning stored OTP data
            redis.get.mockResolvedValue(JSON.stringify({ otp, amount }));
            
            // Mock DB Balance check (called at end of verification)
            db.query
                .mockResolvedValueOnce({}) // Update query result
                .mockResolvedValueOnce({ rows: [{ wallet_balance: 1000 }] }); // getBalance query result

            const result = await walletService.verifyDeposit(userId, otp);

            expect(redis.get).toHaveBeenCalledWith(`deposit_otp:${userId}`);
            // Ensure DB update was called with correct amount
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE users SET wallet_balance"),
                [amount, userId]
            );
            expect(redis.del).toHaveBeenCalledWith(`deposit_otp:${userId}`);
            expect(result.success).toBe(true);
            expect(result.newBalance).toBe(1000);
        });

        it("should throw error for invalid OTP", async () => {
            const userId = "user-123";
            const correctOtp = "123456";
            
            redis.get.mockResolvedValue(JSON.stringify({ otp: correctOtp, amount: 500 }));

            await expect(walletService.verifyDeposit(userId, "999999")) // Wrong OTP
                .rejects.toThrow("Incorrect OTP");
            
            expect(db.query).not.toHaveBeenCalled(); // Balance should not update
        });

        it("should throw error if OTP expired", async () => {
            redis.get.mockResolvedValue(null); // Key missing in Redis

            await expect(walletService.verifyDeposit("user-123", "123456"))
                .rejects.toThrow("OTP expired or invalid");
        });
    });
});