import type { GlobalProvider } from '@ladle/react';
import { NextIntlClientProvider } from 'next-intl';
import '../src/styles/globals.scss';
// @ts-ignore - Vite handles JSON imports
import enMessages from '../src/messages/en.json';
// @ts-ignore - Vite handles JSON imports
import plMessages from '../src/messages/pl.json';

// Import Google Font Montserrat
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href =
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Set CSS variable for font
  document.documentElement.style.setProperty('--font-sans', 'Montserrat');
}

export const Provider: GlobalProvider = ({ children, globalState }) => {
  try {
    // Get locale from story name or default to 'pl'
    const storyName = globalState.story || '';
    const locale = storyName.toLowerCase().includes('english') ? 'en' : 'pl';
    const messages = locale === 'pl' ? plMessages : enMessages;

    return (
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="Europe/Warsaw"
      >
        {children}
      </NextIntlClientProvider>
    );
  } catch (error) {
    console.error('Provider error:', error);
    return <>{children}</>;
  }
};
