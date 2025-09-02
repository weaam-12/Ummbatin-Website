import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Home from './Home';
import * as api from '../api';

// Mock API data
const mockEvents = [
    {
        id: 1,
        title: 'Mock Event',
        description: 'This is a test event.',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        location: 'Test Location',
        imageUrl: '',
        active: true
    }
];

// Mock the API function
vi.spyOn(api, 'getAllEvents').mockResolvedValue(mockEvents);

const renderHome = () => {
    render(
        <BrowserRouter>
            <I18nextProvider i18n={i18n}>
                <Home />
            </I18nextProvider>
        </BrowserRouter>
    );
};

describe('Home accessibility tests', () => {
    test('renders main region with correct aria-label', () => {
        renderHome();
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
        expect(main).toHaveAttribute('aria-label', 'ברוכים הבאים לעיריית אום בטין');
    });

    test('renders accessibility buttons with proper aria attributes', () => {
        renderHome();

        const contrastBtn = screen.getByRole('button', {
            name: /נְגִישׁוּת|נגישות/i
        });
        const fontBtn = screen.getByRole('button', {
            name: /גופן נגיש/i
        });

        expect(contrastBtn).toHaveAttribute('aria-pressed');
        expect(fontBtn).toHaveAttribute('aria-pressed');
    });

    test('renders service list with correct roles', () => {
        renderHome();
        const serviceList = screen.getByRole('list', { name: /שירותי העירייה/i });
        const serviceItems = screen.getAllByRole('listitem');

        expect(serviceList).toBeInTheDocument();
        expect(serviceItems.length).toBeGreaterThan(0);
    });

    test('renders events and allows keyboard interaction to open modal', async () => {
        renderHome();

        const eventCard = await screen.findByRole('button', {
            name: /Mock Event/i
        });

        // Open modal via keyboard
        fireEvent.keyDown(eventCard, { key: 'Enter' });

        const dialog = await screen.findByRole('dialog');
        expect(dialog).toBeInTheDocument();

        // Ensure modal has focusable close button
        const closeBtn = screen.getByRole('button', {
            name: /סגור|إغلاق/i
        });
        expect(closeBtn).toBeInTheDocument();
        expect(closeBtn).toHaveFocus();
    });

    test('modal closes with Escape key and returns focus', async () => {
        renderHome();

        const eventCard = await screen.findByRole('button', {
            name: /Mock Event/i
        });
        eventCard.focus();
        fireEvent.keyDown(eventCard, { key: 'Enter' });

        const closeBtn = await screen.findByRole('button', { name: /סגור|إغلاق/i });
        expect(closeBtn).toHaveFocus();

        fireEvent.keyDown(document, { key: 'Escape' });

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        expect(eventCard).toHaveFocus(); // Focus should return to last element
    });
});