const orderService = require("../../modules/orders/order.service")
const db = require("../../config/db")
const { publishOrderEvent } = require("../../events/order.pubsub")

jest.mock("../../config/db")

jest.mock("../../events/order.pubsub", () => ({
    publishOrderEvent: jest.fn()
}))

describe("Order Service Unit Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    })

    describe("CreatePendingOrder", () => {
        it("should create a pending order successfully", async () => {
            const orderData = {
                userId: "user-id",
                symbol: "RELIANCE",
                quantity: 10,
                side: "BUY",
                orderType: "MARKET"
            };
            db.query.mockResolvedValueOnce({ rows: [] });

            const result = await orderService.createPendingOrder(
                orderData.userId,
                orderData.symbol,
                orderData.quantity,
                orderData.side,
                orderData.orderType
            );
            expect(result).toHaveProperty("id");
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO orders"),
                expect.arrayContaining(["user-id", "RELIANCE", 10, "BUY", "MARKET"])
            )
        })
    })
})