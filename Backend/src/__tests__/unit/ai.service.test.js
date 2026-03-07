// Set required environment variables before any requires
process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";
process.env.GOOGLE_API_KEY = "dummy-test-key";

const { handleAIChat, clearConversationSession } = require("../../ai/services/ai.service");
const db = require("../../config/db");
const { createFinancialAdvisorChain } = require("../../ai/config/langchain.config");

// Mock dependencies
jest.mock("../../config/db", () => ({ query: jest.fn() }));

// Mock langchain configuration
jest.mock("../../ai/config/langchain.config", () => {
    return {
        createFinancialAdvisorChain: jest.fn(),
        model: { invoke: jest.fn() },
        portfolioAnalysisPrompt: { format: jest.fn() },
        stockRecommendationPrompt: { format: jest.fn() }
    };
});

describe("AI Service Unit Tests", () => {

    let mockChainInvoke;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock chain
        mockChainInvoke = jest.fn();
        createFinancialAdvisorChain.mockReturnValue({
            invoke: mockChainInvoke
        });

        // Ensure starting with a clean session map for each user test
        clearConversationSession(123);
    });

    describe("handleAIChat", () => {

        it("should initialize the conversation session and invoke the agent successfully", async () => {
            // Arrange
            const userId = 123;
            const message = "What is my current portfolio value?";

            // Mock empty portfolio from db
            db.query.mockResolvedValueOnce({ rows: [] });
            // Mock empty user holdings
            db.query.mockResolvedValueOnce({ rows: [] });

            const mockAgentResponse = "Your current portfolio value is ₹0 as you have no holdings.";
            mockChainInvoke.mockResolvedValueOnce({ response: mockAgentResponse });

            // Act
            const result = await handleAIChat(userId, message);

            // Assert
            expect(createFinancialAdvisorChain).toHaveBeenCalledTimes(1);
            expect(mockChainInvoke).toHaveBeenCalledWith(expect.objectContaining({
                input: message,
            }));

            expect(result).toEqual({
                success: true,
                response: mockAgentResponse,
                context: expect.any(Object)
            });
        });

        it("should gracefully handle database errors by defaulting to empty portfolio", async () => {
            // Arrange
            const userId = 456;
            const message = "Analyze my stocks.";

            // `getPortfolioSummary` catches db errors and returns a fallback string
            db.query.mockRejectedValue(new Error("Database connection failed"));

            mockChainInvoke.mockResolvedValueOnce({ response: "I see you have no portfolio data currently." });

            // Act 
            const result = await handleAIChat(userId, message);

            // Assert
            expect(db.query).toHaveBeenCalled();
            expect(mockChainInvoke).toHaveBeenCalledWith(expect.objectContaining({
                input: message,
                portfolio_summary: "No holdings yet. Portfolio is empty."
            }));
            expect(result.success).toBe(true);
            expect(result.response).toBe("I see you have no portfolio data currently.");
        });

        it("should handle errors during chain invoke processing gracefully", async () => {
            // Arrange
            const userId = 789;
            const message = "Tell me about TSLA.";

            db.query.mockResolvedValue({ rows: [] }); // mock everything DB related as empty

            mockChainInvoke.mockRejectedValueOnce(new Error("LLM Timeout"));

            // Act & Assert
            await expect(handleAIChat(userId, message)).rejects.toThrow("Failed to generate AI response. Please try again.");
            expect(mockChainInvoke).toHaveBeenCalled();
        });
    });
});
