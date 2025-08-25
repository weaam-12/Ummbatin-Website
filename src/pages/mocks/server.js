import { setupServer } from 'msw/node';
import { rest } from 'msw';

const handlers = [
    rest.get('/api/complaints', (req, res, ctx) =>
        res(
            ctx.json([
                {
                    complaintId: 1,
                    ticketNumber: 'TKT001',
                    type: 'Cleanliness',
                    description: 'פח מלא',
                    status: 'SUBMITTED',
                    date: '2024-01-15',
                },
            ])
        )
    ),

    rest.post('/api/complaints', (req, res, ctx) =>
        res(ctx.json({ complaintId: 99, ticketNumber: 'TKT999' }))
    ),
];

export const server = setupServer(...handlers);