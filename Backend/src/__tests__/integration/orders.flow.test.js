// File: src/__tests__/integration/orders.flow.test.js

// Mock the market snapshot service to control prices during the test
jest.mock("../../modules/market/market.snapshot.service", () => ({
    getPriceSnapshot: jest.fn()
}));

const { request, app } = require("../../testUtils/testUtils"); // Adjusted path
const { executeOrder } = require("../../modules/orders/order.service"); // Adjusted path
const { getPriceSnapshot } = require("../../modules/market/market.snapshot.service"); // Adjusted path
const { connectRedis, redis } = require("../../config/redis"); // Adjusted path

describe("Market BUY Order Integration Flow", () => {
    let token; 
    
    beforeAll(async () => {
        // Ensure Redis is connected before tests start
        await connectRedis();

        // Register a user for testing
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "integration_test@gmail.com",
                password: "Password123",
                username: "int_user",
                phone: "9876543210", 
                fullName: "Integration User"
            });
        
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "integration_test@gmail.com",
                password: "Password123"
            });
        
        token = res.body.accessToken; 
        expect(token).toBeDefined();
    });

    afterAll(async () => {
        if (redis.isOpen) {
            await redis.quit();
        }
    });

    it("should create and execute a MARKET BUY order", async () => {
        // Mock a specific price for this test case
        getPriceSnapshot.mockResolvedValue({ 
            price: 2500,
            source: "CACHE",
            ageMS: 1000
        });

        // 1. Place the Order
        const buyRes = await request(app)
            .post("/api/orders/buy")
            .set("Authorization", `Bearer ${token}`)
            .send({
                symbol: "RELIANCE",
                quantity: 1,
                orderType: "MARKET"
            });

        expect(buyRes.statusCode).toBe(202);
        expect(buyRes.body.status).toBe("PENDING");

        // 2. Manually trigger execution (simulating the worker)
        await executeOrder(buyRes.body.orderId);

        // 3. Verify Order History
        const historyRes = await request(app)
            .get("/api/orders/history")
            .set("Authorization", `Bearer ${token}`);
        
        const order = historyRes.body.orders.find(o => o.id === buyRes.body.orderId);
        
        expect(order).toBeDefined();
        expect(order.status).toBe("EXECUTED");
        expect(Number(order.price)).toBe(2500);
    }, 15000);

    it("should update holdings after BUY", async () => {
        const res = await request(app)
            .get("/api/portfolio")
            .set("Authorization", `Bearer ${token}`);
        
        const holding = res.body.holdings.find(h => h.symbol === "RELIANCE");
        expect(holding).toBeDefined();
        expect(Number(holding.quantity)).toBeGreaterThan(0);
    });

    it("should NOT execute LIMIT BUY when price is not met", async () => {
        // Price is 5000, we want to buy at 100 -> Should NOT execute
        getPriceSnapshot.mockResolvedValue({
            price: 5000,
            source: "CACHE",
            ageMS: 1000
        });

        const res = await request(app)
            .post("/api/orders/buy")
            .set("Authorization", `Bearer ${token}`)
            .send({
                symbol: "BOSCHLTD",
                quantity: 1,
                orderType: "LIMIT",
                limitPrice: 100
            });

        expect(res.statusCode).toBe(202);

        const orderId = res.body.orderId;
        await executeOrder(orderId); // Trigger execution logic

        const historyRes = await request(app)
            .get("/api/orders/history")
            .set("Authorization", `Bearer ${token}`);
        
        const order = historyRes.body.orders.find(o => o.id === orderId);

        expect(order.status).toBe("PENDING"); // Should remain pending
        expect(order.price).toBeNull();
    });

    it("should execute LIMIT BUY when price condition is met", async () => {
        // Price is 38000, we are willing to pay 40000 -> Should EXECUTE
        getPriceSnapshot.mockResolvedValue({
            price: 38000,
            source: "CACHE",
            ageMS: 500
        });

        const res = await request(app)
            .post("/api/orders/buy")
            .set("Authorization", `Bearer ${token}`)
            .send({
                symbol: "BOSCHLTD",
                quantity: 1,
                orderType: "LIMIT",
                limitPrice: 40000
            });

        expect(res.statusCode).toBe(202);

        const orderId = res.body.orderId;
        await executeOrder(orderId);
        
        const historyRes = await request(app)
            .get("/api/orders/history")
            .set("Authorization", `Bearer ${token}`);
        
        const order = historyRes.body.orders.find(o => o.id === orderId);

        expect(order.status).toBe("EXECUTED");
        expect(Number(order.price)).toBe(38000);
    }, 15000);
});