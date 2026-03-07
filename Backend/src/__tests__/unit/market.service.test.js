const { getLivePrice, fetchPriceFromAPI } = require("../../modules/market/market.service");
const axios = require("axios");
const { redis } = require("../../config/redis");

// Mock the dependencies
jest.mock("axios");
jest.mock("../../config/redis", () => ({
    redis: {
        get: jest.fn(),
        setEx: jest.fn(),
    }
}));

// Suppress console logs during tests to keep output clean
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe("Market Service Unit Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getLivePrice", () => {
        it("should return price from Redis cache if available", async () => {
            // Arrange
            const symbol = "RELIANCE";
            redis.get.mockResolvedValueOnce("2500.50");

            // Act
            const result = await getLivePrice(symbol);

            // Assert
            expect(redis.get).toHaveBeenCalledWith(`price:${symbol}`);
            expect(result).toEqual({ price: 2500.5 });
            expect(axios.get).not.toHaveBeenCalled(); // API should not be called
        });

        it("should call fetchPriceFromAPI on cache miss and save to Redis", async () => {
            // Arrange
            const symbol = "HDFC";
            redis.get.mockResolvedValueOnce(null); // Cache miss

            const mockApiResponse = {
                data: {
                    "Time Series (Daily)": {
                        "2023-10-27": { "4. close": "1500.00" },
                        "2023-10-26": { "4. close": "1480.00" }
                    }
                }
            };
            axios.get.mockResolvedValueOnce(mockApiResponse);

            // Act
            const result = await getLivePrice(symbol);

            // Assert
            expect(redis.get).toHaveBeenCalledWith(`price:${symbol}`);
            expect(axios.get).toHaveBeenCalled();
            expect(redis.setEx).toHaveBeenCalledWith(`price:${symbol}`, 300, "1500");
            expect(result).toEqual({ price: 1500 });
        });

        it("should return { price: null } if API fetching fails during cache miss", async () => {
            // Arrange
            const symbol = "INVALID";
            redis.get.mockResolvedValueOnce(null);
            axios.get.mockRejectedValueOnce(new Error("API Error"));

            // Act
            const result = await getLivePrice(symbol);

            // Assert
            expect(result).toEqual({ price: null });
            expect(redis.setEx).not.toHaveBeenCalled();
        });
    });

    describe("fetchPriceFromAPI", () => {
        it("should format symbol correctly and calculate analysis data (NSE/BSE suffix)", async () => {
            // Arrange
            const symbol = "TCS"; // no suffix
            const mockApiResponse = {
                data: {
                    "Time Series (Daily)": {
                        "2023-10-27": { "4. close": "3500.00" },
                        "2023-10-26": { "4. close": "3400.00" }
                    }
                }
            };
            axios.get.mockResolvedValueOnce(mockApiResponse);

            // Act
            const result = await fetchPriceFromAPI(symbol);

            // Assert
            expect(axios.get).toHaveBeenCalledWith(
                "https://www.alphavantage.co/query",
                expect.objectContaining({
                    params: expect.objectContaining({ symbol: "TCS.BSE" })
                })
            );
            expect(result.price).toBe(3500);
            expect(result.analysis.change).toBe(100);
            expect(result.analysis.changePercentage).toBe(2.94); // (100 / 3400) * 100
        });

        it("should return { price: null } when API response is missing Time Series data", async () => {
            // Arrange
            const symbol = "API_LIMIT";
            const mockApiResponse = {
                data: {
                    "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day."
                }
            };
            axios.get.mockResolvedValueOnce(mockApiResponse);

            // Act
            const result = await fetchPriceFromAPI(symbol);

            // Assert
            expect(result).toEqual({ price: null });
        });
    });
});
