import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminComplaints from '../AdminComplaints.jsx';

const queryClient = new QueryClient();

const AllProviders = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

test('يتم عرض التذاكر من الـ API', async () => {
    render(<AdminComplaints />, { wrapper: AllProviders });

    // ننتظر حتى يظهر النص ‎"TKT001"
    await waitFor(() => expect(screen.getByText(/TKT001/i)).toBeInTheDocument());
});