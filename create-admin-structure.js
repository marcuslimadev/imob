const fs = require('fs');
const path = require('path');

// Criar diretórios
const dirs = [
	'c:\\iMOBI\\imobi\\nextjs\\src\\app\\admin',
	'c:\\iMOBI\\imobi\\nextjs\\src\\app\\admin\\dashboard',
	'c:\\iMOBI\\imobi\\nextjs\\src\\app\\admin\\properties',
	'c:\\iMOBI\\imobi\\nextjs\\src\\app\\admin\\leads',
	'c:\\iMOBI\\imobi\\nextjs\\src\\components\\admin',
	'c:\\iMOBI\\imobi\\nextjs\\src\\components\\admin\\dashboard',
];

dirs.forEach((dir) => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`✅ Created: ${dir}`);
	} else {
		console.log(`⏭️  Already exists: ${dir}`);
	}
});

// Criar arquivos do layout admin
const adminLayoutContent = `import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// TODO: Verificar autenticação
	// const session = await getSession();
	// if (!session) redirect('/login');

	return (
		<div className="flex h-screen bg-gray-50">
			<AdminSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
}
`;

const dashboardPageContent = `import { Suspense } from 'react';
import { DashboardStats } from '@/components/admin/dashboard/DashboardStats';
import { LeadsByStage } from '@/components/admin/dashboard/LeadsByStage';
import { RecentActivities } from '@/components/admin/dashboard/RecentActivities';
import { FeaturedProperties } from '@/components/admin/dashboard/FeaturedProperties';

export const metadata = {
	title: 'Dashboard - IMOBI',
	description: 'Painel administrativo',
};

export default async function DashboardPage({
	searchParams,
}: {
	searchParams: Promise<{ company?: string }>;
}) {
	const params = await searchParams;
	const companySlug = params.company || 'exclusiva';

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
				<p className="mt-2 text-gray-600">
					Visão geral do seu negócio imobiliário
				</p>
			</div>

			<Suspense fallback={<StatsLoadingSkeleton />}>
				<DashboardStats companySlug={companySlug} />
			</Suspense>

			<div className="grid gap-6 lg:grid-cols-2">
				<Suspense fallback={<ChartLoadingSkeleton />}>
					<LeadsByStage companySlug={companySlug} />
				</Suspense>

				<Suspense fallback={<ListLoadingSkeleton />}>
					<RecentActivities companySlug={companySlug} />
				</Suspense>
			</div>

			<Suspense fallback={<GridLoadingSkeleton />}>
				<FeaturedProperties companySlug={companySlug} />
			</Suspense>
		</div>
	);
}

function StatsLoadingSkeleton() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{[...Array(4)].map((_, i) => (
				<div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
			))}
		</div>
	);
}

function ChartLoadingSkeleton() {
	return <div className="h-80 animate-pulse rounded-lg bg-white p-6" />;
}

function ListLoadingSkeleton() {
	return <div className="h-80 animate-pulse rounded-lg bg-white p-6" />;
}

function GridLoadingSkeleton() {
	return <div className="h-64 animate-pulse rounded-lg bg-white p-6" />;
}
`;

const adminSidebarContent = `'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	LayoutDashboard,
	Home,
	Users,
	MessageSquare,
	FileText,
	DollarSign,
	Settings,
	Building2,
} from 'lucide-react';

const menuItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		href: '/admin/dashboard',
	},
	{
		label: 'Imóveis',
		icon: Home,
		href: '/admin/properties',
	},
	{
		label: 'Leads',
		icon: Users,
		href: '/admin/leads',
	},
	{
		label: 'Mensagens',
		icon: MessageSquare,
		href: '/admin/messages',
	},
	{
		label: 'Contratos',
		icon: FileText,
		href: '/admin/contracts',
	},
	{
		label: 'Financeiro',
		icon: DollarSign,
		href: '/admin/financial',
	},
	{
		label: 'Configurações',
		icon: Settings,
		href: '/admin/settings',
	},
];

export function AdminSidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-64 border-r border-gray-200 bg-white">
			<div className="flex h-16 items-center border-b border-gray-200 px-6">
				<Building2 className="h-8 w-8 text-blue-600" />
				<span className="ml-2 text-xl font-bold text-gray-900">IMOBI</span>
			</div>

			<nav className="space-y-1 p-4">
				{menuItems.map((item) => {
					const isActive = pathname.startsWith(item.href);
					const Icon = item.icon;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={\`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors \${
								isActive
									? 'bg-blue-50 text-blue-700'
									: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
							}\`}
						>
							<Icon className="h-5 w-5" />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
`;

const adminHeaderContent = `'use client';

import { Bell, Search, User } from 'lucide-react';

export function AdminHeader() {
	return (
		<header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
			<div className="flex flex-1 items-center">
				<div className="relative w-96">
					<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						placeholder="Buscar imóveis, leads, clientes..."
						className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
			</div>

			<div className="flex items-center space-x-4">
				<button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
					<Bell className="h-6 w-6" />
					<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
				</button>

				<div className="flex items-center space-x-3 rounded-lg border border-gray-200 px-3 py-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
						<User className="h-5 w-5" />
					</div>
					<div className="text-sm">
						<p className="font-medium text-gray-900">Admin</p>
						<p className="text-gray-500">Imobiliária Exclusiva</p>
					</div>
				</div>
			</div>
		</header>
	);
}
`;

const files = [
	{
		path: 'c:\\iMOBI\\imobi\\nextjs\\src\\app\\admin\\layout.tsx',
		content: adminLayoutContent,
	},
	{
		path: 'c:\\iMOBI\\imobi\\nextjs\\src\\app\\admin\\dashboard\\page.tsx',
		content: dashboardPageContent,
	},
	{
		path: 'c:\\iMOBI\\imobi\\nextjs\\src\\components\\admin\\AdminSidebar.tsx',
		content: adminSidebarContent,
	},
	{
		path: 'c:\\iMOBI\\imobi\\nextjs\\src\\components\\admin\\AdminHeader.tsx',
		content: adminHeaderContent,
	},
];

files.forEach(({ path: filePath, content }) => {
	fs.writeFileSync(filePath, content, 'utf8');
	console.log(`✅ Created file: ${filePath}`);
});

console.log('\n✅ All directories and base files created successfully!');
