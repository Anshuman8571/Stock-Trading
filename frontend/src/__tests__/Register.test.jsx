import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Explicit extensions added
import Register from '../pages/Register.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

vi.mock('../api/axios.js', () => ({
    default: {
        post: vi.fn()
    }
}));

vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn(),
        success: vi.fn()
    }
}));

describe('Register Component Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show an error if passwords do not match', async () => {
        const { container } = render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        // Robust selection by name attribute
        const FullName = container.querySelector('input[name="fullName"]');
        const UserName = container.querySelector('input[name="username"]');
        const Email = container.querySelector('input[name="email"]');
        const Phone = container.querySelector('input[name="phone"]');
        const passwordInput = container.querySelector('input[name="password"]');
        const confirmInput = container.querySelector('input[name="confirmPassword"]');
        
        fireEvent.change(FullName, { target: {value: "Anshu"} });
        fireEvent.change(UserName, { target: {value: "anshu871"} });
        fireEvent.change(Email, { target: { value: "anshu@example.com" } });
        fireEvent.change(Phone, { target: { value: "1234567890" } })
        fireEvent.change(passwordInput, { target: { value: 'pass123' } });
        fireEvent.change(confirmInput, { target: { value: 'pass456' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Passwords do not match');
            expect(api.post).not.toHaveBeenCalled();
        });
    });

    it('should submit successfully when inputs are valid', async () => {
        api.post.mockResolvedValueOnce({ data: { success: true } });

        const { container } = render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        const fullNameInput = container.querySelector('input[name="fullName"]');
        const usernameInput = container.querySelector('input[name="username"]');
        const emailInput = container.querySelector('input[name="email"]');
        const phoneInput = container.querySelector('input[name="phone"]');
        const passwordInput = container.querySelector('input[name="password"]');
        const confirmInput = container.querySelector('input[name="confirmPassword"]');

        fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
        fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
        fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        fireEvent.change(passwordInput, { target: { value: 'SecurePass1!' } });
        fireEvent.change(confirmInput, { target: { value: 'SecurePass1!' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
        }, { timeout: 2000 });
    });
});