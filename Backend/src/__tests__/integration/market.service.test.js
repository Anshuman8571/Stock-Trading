const marketService = require("../../modules/market/market.service");
const redis = require("../../config/redis");
const axios = require("axios");

jest.mock("axios");
jest.mock("../../config/redis",()=>({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
        setEx: jest.fn()
    }
}));

describe("Market Service Integration Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getLivePrice",() => {
        it("should return cached price if available", async () => {
            redis.redis.get.mockResolvedValue("1500.50");
            const result = await marketService.getLivePrice("RELIANCE");
            // FIX: Check result.price
            expect(result.price).toBe(1500.50);
            expect(axios.get).not.toHaveBeenCalled();
        })

        it("should fetch from API if cache miss ", async () =>{
            redis.redis.get.mockResolvedValue(null);
            
            // FIX: Update mock to match AlphaVantage "Time Series (Daily)" format
            axios.get.mockResolvedValue({
                data: { 
                    "Time Series (Daily)": {
                        "2023-10-27": { "4. close": "1500.50" },
                        "2023-10-26": { "4. close": "1490.00" }
                    }
                }
            });

            const result = await marketService.getLivePrice("RELIANCE")
            // FIX: Check result.price
            expect(result.price).toBe(1500.50);
            expect(redis.redis.setEx).toHaveBeenCalled();
        })
    })
})