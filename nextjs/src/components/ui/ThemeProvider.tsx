'use client';
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { DEFAULT_DESIGN_THEME } from '@/lib/design-themes';

interface DesignThemeContext {
        themeKey: string;
        setThemeKey: (theme: string) => void;
}

const ThemeContext = createContext<DesignThemeContext>({
        themeKey: 'ulm',
        setThemeKey: () => {},
});

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
        const getCookieValue = (key: string) => {
                if (typeof document === 'undefined') {
                        return null;
                }

                const cookies = document.cookie?.split('; ') || [];
                const match = cookies.find((row) => row.startsWith(`${key}=`));

                return match ? decodeURIComponent(match.split('=')[1]) : null;
        };

        const getStoredValue = (key: string) => {
                if (typeof window === 'undefined') {
                        return null;
                }

                try {
                        return localStorage.getItem(key);
                } catch (error) {
                        console.warn('Storage unavailable, falling back to defaults', error);

                        return null;
                }
        };

        const getInitialTheme = () => {
                const storedTheme = getStoredValue('theme');

                if (storedTheme) {
                        return storedTheme;
                }

                if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        return 'dark';
                }

                return 'light';
        };

        const getInitialDesignTheme = () => {
                const documentTheme = typeof document !== 'undefined'
                        ? document.documentElement.getAttribute('data-theme')
                        : null;

                if (documentTheme) {
                        return documentTheme;
                }

                const cookieTheme = getCookieValue('design-theme');

                if (cookieTheme) {
                        return cookieTheme;
                }

                const storedDesignTheme = getStoredValue('design-theme');

                if (storedDesignTheme) {
                        return storedDesignTheme;
                }

                return DEFAULT_DESIGN_THEME;
        };

        const [theme, setTheme] = useState(getInitialTheme);
        const [themeKey, setThemeKey] = useState(getInitialDesignTheme);

        const setDesignThemeCookie = (value: string) => {
                if (typeof document === 'undefined') {
                        return;
                }

                try {
                        document.cookie = `design-theme=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
                } catch (error) {
                        console.warn('Cookie unavailable, skipping design-theme persistence', error);
                }
        };

        useEffect(() => {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
                localStorage.setItem('theme', theme);
        }, [theme]);

        useEffect(() => {
                document.documentElement.setAttribute('data-theme', themeKey);
                localStorage.setItem('design-theme', themeKey);
                setDesignThemeCookie(themeKey);
        }, [themeKey]);

        return (
                <ThemeContext.Provider value={{ themeKey, setThemeKey }}>
                        <NextThemesProvider attribute="class" defaultTheme={theme} enableSystem disableTransitionOnChange {...props}>
                                {children}
                        </NextThemesProvider>
                </ThemeContext.Provider>
        );
}

export const useDesignTheme = () => useContext(ThemeContext);
