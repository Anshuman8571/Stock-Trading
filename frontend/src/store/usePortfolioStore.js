import { create } from 'zustand';
import api from '../api/axios';

export const usePortfolioStore = create((set, get) => ({
    analytics: null,
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
            const { data } = await api.get('/portfolio/analytics');
            set({ analytics: data.analytics, lastFetched: now, loading: false });
        } catch (error) {
            console.error("Dashboard Load Error:", error);
            set({ loading: false });
        }
    }
}));