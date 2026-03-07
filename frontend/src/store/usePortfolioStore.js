import { create } from 'zustand';
import api from '../api/axios';

export const usePortfolioStore = create((set, get) => ({
    analytics: null,
    walletBalance: 0,
    loading: false,
    lastFetched: null,

    fetchAnalytics: async (forceRefresh = false) => {
        const { analytics, lastFetched } = get();
        const now = Date.now();

        // If we already have data and it's less than 5 minutes old, don't fetch again
        if (!forceRefresh && analytics && lastFetched && (now - lastFetched < 5 * 60 * 1000)) {
            return;
        }

        set({ loading: true });
        try {
            const [analyticsRes, walletRes] = await Promise.all([
                api.get('/portfolio/analytics'),
                api.get('/wallet/balance')
            ]);
            set({
                analytics: analyticsRes.data.analytics,
                walletBalance: Number(walletRes.data.balance),
                lastFetched: now,
                loading: false
            });
        } catch (error) {
            console.error("Dashboard Load Error:", error);
            set({ loading: false });
        }
    },

    updateWalletBalance: (newBalance) => set({ walletBalance: newBalance })
}));