// FIX: Import the analysis service instead
const portfolioAnalysisService = require("../../modules/portfolio/portfolio.analysis.service");
const portfolioService = require("../../modules/portfolio/portfolio.service");
const marketService = require("../../modules/market/market.service");
const db = require("../../config/db");

// Mock dependencies
jest.mock("../../config/db");
jest.mock("../../modules/portfolio/portfolio.service");
jest.mock("../../modules/market/market.service");

describe("Portfolio Analysis Service Unit Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe("getPortfolioAnalytics", () => {
        it("should calculate portfolio value and PnL", async () => {
            // Mock portfolio ID retrieval
            portfolioService.getOrCreatePortfolio.mockResolvedValue({ id: "port-id", user_id: "user-id" });

            // Mock Holdings (Use 'avg_price' to match DB column name expected by service)
            const mockHoldings = [{
                symbol: "RELIANCE",
                quantity: 10,
                avg_price: 1000 
            }];

            db.query.mockResolvedValueOnce({ rows: mockHoldings });
            
            // Mock Live Price
            marketService.getLivePrice.mockResolvedValue({ price: 1200 });

            const result = await portfolioAnalysisService.getPortfolioAnalytics("user-id");

            // Assertions based on Analysis Service output structure
            expect(result.breakdown).toHaveLength(1);
            expect(result.currentValue).toBe(12000);   // 10 * 1200
            expect(result.investedValue).toBe(10000);  // 10 * 1000
            expect(result.pnl).toBe(2000);             // 12000 - 10000
        })
    })
})