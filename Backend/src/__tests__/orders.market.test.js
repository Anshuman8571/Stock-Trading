jest.mock("../modules/market/market.snapshot.service", () => ({
    getPriceSnapshot: jest.fn()
}));

const { request, app } = require("../testUtils/testUtils");
const { executeOrder } = require("../modules/orders/order.service");
const { getPriceSnapshot } = require("../modules/market/market.snapshot.service");
const { connectRedis, redis } = require("../config/redis"); // ✅ Import Redis

describe("Market BUY order Flow", () => {
    let token; 
    
    beforeAll(async () => {
        // ✅ FIX 1: Ensure Redis is connected before tests start
        await connectRedis();

        // ✅ FIX 2: Added 'phone' and 'fullName' (Required by your auth.validator.js)
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "test_market@gmail.com",
                password: "Password123",
                username: "testuser",
                phone: "9876543210", 
                fullName: "Test User"
            });
        
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test_market@gmail.com",
                password: "Password123"
            });
        
        token = res.body.accessToken; 
        expect(token).toBeDefined();
    });

    // ✅ FIX 3: Close Redis connection after tests
    afterAll(async () => {
        if (redis.isOpen) {
            await redis.quit();
        }
    });

    it("should create and execute a MARKET BUY order", async () => {
        getPriceSnapshot.mockResolvedValue({ 
            price: 2500,
            source: "CACHE",
            ageMS: 1000
        });

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

        await executeOrder(buyRes.body.orderId);

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
        expect(orderId).toBeDefined();

        await executeOrder(orderId);

        const historyRes = await request(app)
            .get("/api/orders/history")
            .set("Authorization", `Bearer ${token}`);
        
        const order = historyRes.body.orders.find(o => o.id === orderId);

        expect(order.status).toBe("PENDING");
        expect(order.price).toBeNull();
    });

    it("should execute LIMIT BUY when price condition is met", async () => {
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
        expect(orderId).toBeDefined();
        
        await executeOrder(orderId);
        
        const historyRes = await request(app)
            .get("/api/orders/history")
            .set("Authorization", `Bearer ${token}`);
        
        const order = historyRes.body.orders.find(o => o.id === orderId);

        expect(order.status).toBe("EXECUTED");
        expect(Number(order.price)).toBe(38000);
    }, 15000);
});