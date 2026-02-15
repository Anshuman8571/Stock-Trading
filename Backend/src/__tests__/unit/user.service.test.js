const userService = require("../../modules/user/user.service");
const db = require("../../config/db");

jest.mock("../../config/db");

describe("User Service Unit Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("getUserById", ()=>{ // FIX: Changed description
        it("should return user profile excluding password", async () =>{
            const mockUser = { id: "user-id", email:"test@example.com", username: "testuser" }
            db.query.mockResolvedValueOnce({ rows: [mockUser] });
            
            // FIX: Call getUserById instead of getUserProfile
            const result = await userService.getUserById("user-id");
            
            expect(result).toEqual(mockUser);
            // FIX: Query check might differ slightly, checking generic call
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining("SELECT id, username, email FROM users"), ["user-id"]);
        });

        // Note: getUserById returns null if not found, it doesn't throw. 
        // If you want to test the controller logic that throws 404, that belongs in a controller test.
        // If we test the service strictly:
        it("should return null if user not found", async () =>{
            db.query.mockResolvedValueOnce({ rows: [] });
            const result = await userService.getUserById("invalid-id");
            expect(result).toBeNull();
        })
    })
})