import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../pages/Login.jsx';
import * as AuthContext from '../context/AuthContext.jsx';

// 1. Mock the Auth Context
vi.mock('../context/AuthContext.jsx', () => ({
    useAuth: vi.fn(),
}));

// 2. Mock the Google OAuth library to avoid resolution errors during testing
vi.mock('@react-oauth/google', () => ({
    useGoogleLogin: vi.fn(() => vi.fn()),
    GoogleOAuthProvider: ({ children }) => <div>{children}</div>
}));

describe('Login Component Integration', () => {
    const mockLogin = vi.fn();
    const mockGoogleLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock returns
        AuthContext.useAuth.mockReturnValue({
            login: mockLogin,
            googleLogin: mockGoogleLogin,
        });
    });

    it('should render the login form correctly', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        // Check for the Google button text instead of role to be safer with SVGs
        expect(screen.getByText(/CONTINUE WITH GOOGLE/i)).toBeInTheDocument();
    });

    it('should update state on input changes', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText('you@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');

        fireEvent.change(emailInput, { target: { value: 'test@trader.com' } });
        fireEvent.change(passwordInput, { target: { value: 'securepassword123' } });

        expect(emailInput.value).toBe('test@trader.com');
        expect(passwordInput.value).toBe('securepassword123');
    });

    it('should successfully call login function on form submit', async () => {
        mockLogin.mockResolvedValueOnce({ success: true });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText('you@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        // Find the specific Sign In button
        const submitButton = screen.getByRole('button', { name: /Sign In/i });

        fireEvent.change(emailInput, { target: { value: 'test@trader.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // Fast forward through the UI network delay
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@trader.com', 'password123');
        }, { timeout: 2000 });
    });
});