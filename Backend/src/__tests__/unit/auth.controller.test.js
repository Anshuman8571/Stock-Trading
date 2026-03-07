const {
    register,
    login,
    checkPIN,
    createPIN,
    pinLogin,
    removePIN
} = require('../../modules/auth/auth.controller');
const authService = require('../../modules/auth/auth.service');

// Mock the auth service dependency completely
jest.mock('../../modules/auth/auth.service');

describe("Auth Controller Unit Tests", () => {

    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            query: {},
            user: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe("register", () => {
        it("should register a user successfully and return 201", async () => {
            req.body = { email: "test@test.com", password: "pass", username: "tester", fullName: "Test User", phone: "123" };
            const mockUser = { id: 1, email: "test@test.com" };
            authService.registerUser.mockResolvedValueOnce(mockUser);

            await register(req, res, next);

            expect(authService.registerUser).toHaveBeenCalledWith({
                email: "test@test.com", password: "pass", username: "tester", full_name: "Test User", phone: "123"
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Registration successful",
                user: mockUser
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with error if required fields are missing", async () => {
            req.body = { email: "test@test.com" }; // missing password and username

            await register(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe("Email, Password and Username are required");
            expect(next.mock.calls[0][0].status).toBe(400);
        });
    });

    describe("login", () => {
        it("should login user and return token successfully", async () => {
            req.body = { email: "test@test.com", password: "pass" };
            const mockLoginResult = { token: "jwt-token", user: { id: 1 } };
            authService.loginUser.mockResolvedValueOnce(mockLoginResult);

            await login(req, res, next);

            expect(authService.loginUser).toHaveBeenCalledWith("test@test.com", "pass");
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Login successful.",
                ...mockLoginResult
            });
        });

        it("should call next with error if login fails (e.g. invalid credentials)", async () => {
            req.body = { email: "test@test.com", password: "wrong" };
            const authError = new Error("Invalid credentials");
            authService.loginUser.mockRejectedValueOnce(authError);

            await login(req, res, next);

            expect(next).toHaveBeenCalledWith(authError);
        });
    });

    describe("PIN functionality", () => {
        it("checkPIN should return PIN status successfully", async () => {
            req.query = { email: "test@test.com" };
            authService.checkPINStatus.mockResolvedValueOnce({ hasPIN: true });

            await checkPIN(req, res, next);

            expect(authService.checkPINStatus).toHaveBeenCalledWith("test@test.com");
            expect(res.json).toHaveBeenCalledWith({ hasPIN: true });
        });

        it("createPIN should call auth service with user id and pin", async () => {
            req.body = { pin: "1234" };
            req.user = { userId: 1 };
            authService.setupPIN.mockResolvedValueOnce({ success: true, message: "PIN set" });

            await createPIN(req, res, next);

            expect(authService.setupPIN).toHaveBeenCalledWith(1, "1234");
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "PIN set" });
        });

        it("pinLogin should authenticate user using PIN", async () => {
            req.body = { email: "test@test.com", pin: "1234" };
            const mockResult = { token: "jwt-token", user: { id: 1 } };
            authService.quickLoginWithPIN.mockResolvedValueOnce(mockResult);

            await pinLogin(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Quick login successful",
                ...mockResult
            });
        });
    });
});
