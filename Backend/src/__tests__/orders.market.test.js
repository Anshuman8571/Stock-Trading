jest.mock("../modules/market/market.snapshot.service",() => ({
    getPriceSnapshot: jest.fn()
}));

const { request, app } = require("../testUtils/testUtils")
const { executeOrder } = require("../modules/orders/order.service");
const { getPriceSnapshot } = require("../modules/market/market.snapshot.service");

describe("Market BUY order Flow",()=>{
    let token; // this is where we will store token after login
    beforeAll(async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "abcde@gmail.com",
                password: "abcdefghijklmnopqrstuvwxyz"
            });
        token = res.body.accessToken; //AccessToken is stored here after login
        expect(token).toBeDefined()
    })

    it("should create and execute a MARKET BUY order",async () => {
        getPriceSnapshot.mockResolvedValue({ 
            price:2500,
            source: "CACHE",
            ageMS: 1000
        })
        const buyRes = await request(app) // Created a buy order
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
        
        const order = historyRes.body.orders.find(o => o.id === buyRes.body.orderId)
        // As the order will be executed by the order worker, so we need to wait for its execution it will have to make multiple API calls so that will take time 
        
        expect(order).toBeDefined()
        expect(order.status).toBe("EXECUTED");
        expect(Number(order.price)).toBe(2500);
    }, 15000)


    it("should update holdings after BUY", async () => {
        const res = await request(app)
            .get("/api/portfolio")
            .set("Authorization", `Bearer ${token}`)
        const holding = res.body.holdings.find(h => h.symbol === "RELIANCE")
        expect(holding).toBeDefined();
        expect(holding.quantity).toBeGreaterThan(0)
    })

    it("should NOT execute LIMIT BUY when price is not met", async () => {
        getPriceSnapshot.mockResolvedValue({
            price: 5000,
            source: "CACHE",
            ageMS: 1000
        })
        const res = await request(app)
            .post("/api/orders/buy")
            .set("Authorization", `Bearer ${token}`)
            .send({
                symbol: "BOSCHLTD",
                quantity: 1,
                orderType: "LIMIT",
                limitPrice: 100
            })
        expect(res.statusCode).toBe(202);

        const historyRes = await request(app)
            .get("/api/orders/history")
            .set("Authorization", `Bearer ${token}`)
        
        const orderId = res.body.orderId;
        expect(orderId).toBeDefined();

        const order = historyRes.body.orders.find(o => o.id === orderId)

        expect(order.status).toBe("PENDING")
        expect(order.price).toBeNull();
    })


    it("should execute LIMIT BUY when price condition is met", async () =>{
        getPriceSnapshot.mockResolvedValue({
            price: 38000,
            source: "CACHE",
            ageMS: 500
        })
        const res = await request(app)
            .post("/api/orders/buy")
            .set("Authorization", `Bearer ${token}`)
            .send({
                symbol: "BOSCHLTD",
                quantity: 1,
                orderType: "LIMIT",
                limitPrice: 40000
            })
        expect(res.statusCode).toBe(202);

        const orderId = res.body.orderId;
        expect(orderId).toBeDefined();
        
        await executeOrder(orderId);
        
        const historyRes = await request(app)
            .get("/api/orders/history")
            .set("Authorization", `Bearer ${token}`)
        const order = historyRes.body.orders.find(o => o.id === orderId)

        expect(order.status).toBe("EXECUTED");
        expect(Number(order.price)).toBe(38000)
    }, 15000)

})