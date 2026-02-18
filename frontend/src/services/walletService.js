import api from '../api/axios';

export const getWalletBalance = async () => {
    const response = await api.get('/wallet/balance');
    return response.data.balance;
};

export const initiateDeposit = async (amount) => {
    const response = await api.post('/wallet/deposit/init', { amount });
    return response.data;
};

export const verifyDeposit = async (otp) => {
    const response = await api.post('/wallet/deposit/verify', { otp });
    return response.data;
};