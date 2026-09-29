import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'SIGD-SIC';

createInertiaApp({
    title: (title) => `${title} — ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true });
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) {
            throw new Error(`Página não encontrada: ./Pages/${name}.tsx`);
        }
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#C5A059',
        showSpinner: true,
    },
});
