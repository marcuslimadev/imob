import '@/styles/globals.css';
import '@/styles/themes.css';
import '@/styles/fonts.css';
import '@/lib/suppressConsoleErrors';
import { ReactNode } from 'react';
import { Metadata } from 'next';

import VisualEditingLayout from '@/components/layout/VisualEditingLayout';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import SuppressConsoleErrors from '@/components/SuppressConsoleErrors';
import { fetchSiteData } from '@/lib/directus/fetchers';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';

export async function generateMetadata(): Promise<Metadata> {
	try {
		const { globals } = await fetchSiteData();

		const siteTitle = globals?.title || 'iMOBI - CRM Inteligente';
		const siteDescription = globals?.description || 'CRM completo para imobiliárias com WhatsApp IA e automação de vendas.';
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

	return (
		<html lang="pt-BR" style={{ '--accent-color': accentColor } as React.CSSProperties} suppressHydrationWarning>
			<body className="antialiased font-sans flex flex-col min-h-screen">
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
