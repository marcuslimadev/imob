'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import { useRouter, usePathname } from 'next/navigation';
import NavigationBar from '@/components/layout/NavigationBar';
import Footer from '@/components/layout/Footer';

interface VisualEditingLayoutProps {
	headerNavigation: any;
	footerNavigation: any;
	globals: any;
	children: ReactNode;
}

// Rotas que não devem mostrar o layout público (header/footer)
const ROUTES_WITHOUT_LAYOUT = ['/', '/login', '/empresa', '/admin'];

export default function VisualEditingLayout({
	headerNavigation,
	footerNavigation,
	globals,
	children,
}: VisualEditingLayoutProps) {
	const navRef = useRef<HTMLElement>(null);
	const footerRef = useRef<HTMLElement>(null);
	const { isVisualEditingEnabled, apply } = useVisualEditing();
	const router = useRouter();
	const pathname = usePathname();

	// Verifica se a rota atual deve esconder o layout público
	const shouldHideLayout = ROUTES_WITHOUT_LAYOUT.some(route => 
		pathname === route || pathname?.startsWith(route + '/')
	);

	console.log('[VisualEditingLayout]', { pathname, shouldHideLayout });

	useEffect(() => {
		if (isVisualEditingEnabled && !shouldHideLayout) {
			// Apply visual editing for the navigation bar if its ref is set.
			if (navRef.current) {
				apply({
					elements: [navRef.current],
					onSaved: () => router.refresh(),
				});
			}
			// Apply visual editing for the footer if its ref is set.
			if (footerRef.current) {
				apply({
					elements: [footerRef.current],
					onSaved: () => router.refresh(),
				});
			}
		}
	}, [isVisualEditingEnabled, apply, router, shouldHideLayout]);

	// Se for rota sem layout, renderiza apenas o children
	if (shouldHideLayout) {
		return <>{children}</>;
	}

	return (
		<>
			<NavigationBar ref={navRef} navigation={headerNavigation} globals={globals} />
			{children}
			<Footer ref={footerRef} navigation={footerNavigation} globals={globals} />
		</>
	);
}
