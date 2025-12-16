import '@/styles/globals.css';
import '@/styles/fonts.css';
import '@/lib/suppressConsoleErrors';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import Script from 'next/script';
import { cookies } from 'next/headers';

import VisualEditingLayout from '@/components/layout/VisualEditingLayout';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import SuppressConsoleErrors from '@/components/SuppressConsoleErrors';
import { fetchSiteData } from '@/lib/directus/fetchers';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';
import { DEFAULT_DESIGN_THEME } from '@/lib/design-themes';

export async function generateMetadata(): Promise<Metadata> {
	try {
		const { globals } = await fetchSiteData();

		const siteTitle = globals?.title || 'SociMob - Atendente WhatsApp para Imobiliárias';
		const siteDescription = globals?.description || 'Plataforma SaaS com atendente virtual WhatsApp, CRM de leads e gestão inteligente para imobiliárias.';
		const faviconURL = '/logo.png'; // Use logo.png as favicon

		return {
			title: {
				default: siteTitle,
				template: `%s | ${siteTitle}`,
			},
			description: siteDescription,
			icons: {
				icon: faviconURL,
			},
		};
	} catch (error) {
		// Fallback metadata when Directus is not available
		return {
			title: {
				default: 'iMOBI - CRM Inteligente',
				template: '%s | iMOBI',
			},
			description: 'CRM completo para imobiliárias com WhatsApp IA e automação de vendas.',
			icons: {
				icon: '/logo.png',
			},
		};
	}
}

export default async function RootLayout({ children }: { children: ReactNode }) {
	let globals = null;
	let headerNavigation = null;
	let footerNavigation = null;

	try {
		const siteData = await fetchSiteData();
		globals = siteData.globals;
		headerNavigation = siteData.headerNavigation;
		footerNavigation = siteData.footerNavigation;
	} catch (error) {
		console.log('Running in offline mode - Directus data unavailable');
	}

        const accentColor = globals?.accent_color || '#d90429';
        const cookieStore = await cookies();
        const themeCookie = cookieStore.get('design-theme')?.value;
        const initialDesignTheme = themeCookie || DEFAULT_DESIGN_THEME;

	return (
                <html
                        lang="pt-BR"
                        data-theme={initialDesignTheme}
                        style={{ '--accent-color': accentColor } as React.CSSProperties}
                        suppressHydrationWarning
                >
                        <body className="antialiased font-sans flex flex-col min-h-screen">
                                <Script
                                        id="design-theme-init"
                                        strategy="beforeInteractive"
                                        dangerouslySetInnerHTML={{
                                                __html: `(() => { try { const fallback = ${JSON.stringify(DEFAULT_DESIGN_THEME)}; const cookieTheme = (document.cookie || '').split('; ').find((row) => row.startsWith('design-theme='))?.split('=')[1]; const stored = localStorage.getItem('design-theme'); document.documentElement.setAttribute('data-theme', stored || cookieTheme || fallback); } catch (error) { document.documentElement.setAttribute('data-theme', ${JSON.stringify(DEFAULT_DESIGN_THEME)}); } })();`,
                                        }}
                                />
                                <SuppressConsoleErrors />
                                <ThemeProvider>
                                        <AuthProvider>
						<VisualEditingLayout
							headerNavigation={headerNavigation}
							footerNavigation={footerNavigation}
							globals={globals}
						>
							<main className="flex-grow">{children}</main>
						</VisualEditingLayout>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
