import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import * as AuthContext from '../context/AuthContext';
import api from '../api/axios';

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

describe('Dashboard Component API Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        AuthContext.useAuth.mockReturnValue({
            user: { username: 'ProTrader123' }
        });
    });

    it('shows loading state on initial render', () => {
        // Return a promise that never resolves to keep it in loading state
        api.get.mockImplementation(() => new Promise(() => {})); 
        
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(screen.getByText(/SYNCING PORTFOLIO/i)).toBeInTheDocument();
    });

    it('renders portfolio analytics successfully after API call', async () => {
        // Mock successful backend response
        api.get.mockResolvedValueOnce({
            data: {
                analytics: {
                    currentValue: 150000,
                    investedValue: 100000,
                    pnl: 50000,
                    breakdown: [
                        { symbol: 'RELIANCE', quantity: 10, avg_price: 2500, current_value: 30000 }
                    ]
                }
            }
        });

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        // Wait for loading to finish and data to populate
        await waitFor(() => {
            // Checks if user info rendered
            expect(screen.getByText(/Welcome back, ProTrader123/i)).toBeInTheDocument();
            // Checks if the mocked asset loaded in the table
            expect(screen.getByText('RELIANCE')).toBeInTheDocument();
        });
    });
});