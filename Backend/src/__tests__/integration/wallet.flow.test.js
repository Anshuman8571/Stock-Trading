const { request, app } = require("../../testUtils/testUtils");
const { connectRedis, redis } = require("../../config/redis");
const { executeOrder } = require("../../modules/orders/order.service");
const { getPriceSnapshot } = require("../../modules/market/market.snapshot.service");

// Mock market snapshot to control price for order tests
jest.mock("../../modules/market/market.snapshot.service", () => ({
    getPriceSnapshot: jest.fn()
}));

describe("Wallet & Trading Integration Flow", () => {
    let token;
    let userId;
    const testEmail = `wallet_test_fixed@gmail.com`;
    const testUser = {
        email: testEmail,
        password: "Password123",
        username: 'wallet_tester',
        fullName: "Wallet Tester",
        phone: '8880000002'
    };

    beforeAll(async () => {
        await connectRedis();

        // 1. Register User
        await request(app).post("/api/auth/register").send(testUser);

        // 2. Login
        const loginRes = await request(app).post("/api/auth/login").send({
            email: testUser.email,
            password: testUser.password
        });

        token = loginRes.body.accessToken;
        userId = loginRes.body.user.id;
        expect(token).toBeDefined();
    });

    afterAll(async () => {
        if (token) {
            await request(app).delete("/api/user/me").set("Authorization", `Bearer ${token}`);
        }
        if (redis.isOpen) await redis.quit();
    });

    it("should start with 0 balance", async () => {
        const res = await request(app)
            .get("/api/wallet/balance")
            .set("Authorization", `Bearer ${token}`);

        expect(res.body.balance).toBe(0);
    });

    it("should successfully deposit money via OTP flow", async () => {
        const depositAmount = 10000;

        // 1. Initiate Deposit
        const initRes = await request(app)
            .post("/api/wallet/deposit/init")
            .set("Authorization", `Bearer ${token}`)
            .send({ amount: depositAmount });

        expect(initRes.statusCode).toBe(200);

        // 2. FETCH OTP FROM REDIS (Simulating User receiving SMS)
        const redisKey = `deposit_otp:${userId}`;
        const redisData = await redis.get(redisKey);

        expect(redisData).not.toBeNull();
        const { otp } = JSON.parse(redisData);

        // 3. Verify Deposit using the OTP
        const verifyRes = await request(app)
            .post("/api/wallet/deposit/verify")
            .set("Authorization", `Bearer ${token}`)
            .send({ otp });

        expect(verifyRes.statusCode).toBe(200);
        expect(verifyRes.body.success).toBe(true);
        expect(Number(verifyRes.body.newBalance)).toBe(depositAmount);
    });

    it("should fail to BUY stock if balance is insufficient", async () => {
        // Current Balance: 10,000 (from previous test)
        // Stock Price: 15,000
        // Attempting to buy 1 -> Should Fail

        getPriceSnapshot.mockResolvedValue({ price: 15000, source: "CACHE", ageMS: 0 });

        const buyRes = await request(app)
            .post("/api/orders/buy")
            .set("Authorization", `Bearer ${token}`)
            .send({
                symbol: "ExpensiveStock",
                quantity: 1,
                orderType: "MARKET"
            });

        const orderId = buyRes.body.orderId;

        // Execute Order
        try {
            await executeOrder(orderId);
        } catch (error) {
            // ✅ FIX: Use case-insensitive regex (/i) to match "Wallet Balance"
            expect(error.message).toMatch(/Insufficient wallet balance/i);
        }

        // Verify Order Status in DB is FAILED
        const historyRes = await request(app)
            .get("/api/orders/history")
            .set("Authorization", `Bearer ${token}`);

        const order = historyRes.body.orders.find(o => o.id === orderId);
        expect(order.status).toBe("FAILED");
        expect(order.failure_reason).toMatch(/Insufficient wallet balance/i);
    });

    it("should successfully BUY stock and deduct balance", async () => {
        // Current Balance: 10,000
        // Stock Price: 2,000
        // Buy 2 -> Cost 4,000 -> Remaining: 6,000

        getPriceSnapshot.mockResolvedValue({ price: 2000, source: "CACHE", ageMS: 0 });

        const buyRes = await request(app)
            .post("/api/orders/buy")
            .set("Authorization", `Bearer ${token}`)
            .send({
                symbol: "CheapStock",
                quantity: 2,
                orderType: "MARKET"
            });

        await executeOrder(buyRes.body.orderId);

        // Check Wallet Balance
        const balanceRes = await request(app)
            .get("/api/wallet/balance")
            .set("Authorization", `Bearer ${token}`);

        expect(Number(balanceRes.body.balance)).toBe(6000); // 10000 - 4000
    });
});