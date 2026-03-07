import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import * as AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { usePortfolioStore } from '../store/usePortfolioStore';

// Mock Auth Context
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// Mock Axios API
vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn()
    }
}));

// Mock Zustand Store
vi.mock('../store/usePortfolioStore', () => ({
    usePortfolioStore: vi.fn()
}));

describe('Dashboard Component API Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        AuthContext.useAuth.mockReturnValue({
            user: { username: 'ProTrader123' }
        });
    });

    it('shows loading state on initial render', () => {
        usePortfolioStore.mockReturnValue({
            analytics: null,
            walletBalance: 0,
            loading: true,
            fetchAnalytics: vi.fn()
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(screen.getByText(/SYNCING PORTFOLIO/i)).toBeInTheDocument();
    });

    it('renders portfolio analytics successfully after API call', async () => {
        usePortfolioStore.mockReturnValue({
            analytics: {
                currentValue: 150000,
                investedValue: 100000,
                pnl: 50000,
                breakdown: [
                    { symbol: 'RELIANCE', quantity: 10, avg_price: 2500, current_value: 30000 }
                ]
            },
            walletBalance: 50000,
            loading: false,
            fetchAnalytics: vi.fn()
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        // Wait for loading to finish and data to populate
        await waitFor(() => {
            // Checks if user info rendered (split because of internal span)
            expect(screen.getByText(/Welcome back,/i)).toBeInTheDocument();
            expect(screen.getByText('ProTrader123')).toBeInTheDocument();
            // Checks if the mocked asset loaded in the table
            expect(screen.getByText('RELIANCE')).toBeInTheDocument();
        });
    });
});