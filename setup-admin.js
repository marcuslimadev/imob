const fs = require('fs');
const path = require('path');

console.log('🚀 Criando estrutura do painel administrativo...\n');

// Criar diretórios
const dirs = [
	'nextjs/src/app/admin',
	'nextjs/src/app/admin/dashboard',
	'nextjs/src/app/admin/properties',
	'nextjs/src/app/admin/leads',
	'nextjs/src/components/admin',
	'nextjs/src/components/admin/dashboard',
];

dirs.forEach((dir) => {
	const fullPath = path.join(__dirname, dir);
	if (!fs.existsSync(fullPath)) {
		fs.mkdirSync(fullPath, { recursive: true });
		console.log(`✅ Diretório criado: ${dir}`);
	}
});

console.log('\n📝 Criando arquivos...\n');

// Arquivos a criar
const files = {
	'nextjs/src/app/admin/layout.tsx': `import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
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
`,

	'nextjs/src/app/admin/dashboard/page.tsx': `import { Suspense } from 'react';
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
`,

	'nextjs/src/components/admin/AdminSidebar.tsx': `'use client';

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
	{ label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
	{ label: 'Imóveis', icon: Home, href: '/admin/properties' },
	{ label: 'Leads', icon: Users, href: '/admin/leads' },
	{ label: 'Mensagens', icon: MessageSquare, href: '/admin/messages' },
	{ label: 'Contratos', icon: FileText, href: '/admin/contracts' },
	{ label: 'Financeiro', icon: DollarSign, href: '/admin/financial' },
	{ label: 'Configurações', icon: Settings, href: '/admin/settings' },
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
`,

	'nextjs/src/components/admin/AdminHeader.tsx': `'use client';

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
`,

	'nextjs/src/components/admin/dashboard/DashboardStats.tsx': `import { Home, Users, Eye, FileText } from 'lucide-react';
import { fetchDashboardStats } from '@/lib/directus/realEstate';

export async function DashboardStats({ companySlug }: { companySlug: string }) {
	const stats = await fetchDashboardStats(companySlug);

	const cards = [
		{ label: 'Total de Imóveis', value: stats.totalProperties, icon: Home, color: 'bg-blue-500' },
		{ label: 'Leads Novos', value: stats.newLeads, icon: Users, color: 'bg-green-500' },
		{ label: 'Visitas (30 dias)', value: stats.monthlyViews.toLocaleString(), icon: Eye, color: 'bg-purple-500' },
		{ label: 'Propostas Ativas', value: stats.activeProposals, icon: FileText, color: 'bg-orange-500' },
	];

	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<div key={card.label} className="overflow-hidden rounded-lg bg-white shadow">
						<div className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">{card.label}</p>
									<p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
								</div>
								<div className={\`rounded-lg p-3 \${card.color}\`}>
									<Icon className="h-6 w-6 text-white" />
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
`,

	'nextjs/src/components/admin/dashboard/LeadsByStage.tsx': `import { fetchLeadsByStage } from '@/lib/directus/realEstate';

export async function LeadsByStage({ companySlug }: { companySlug: string }) {
	const leadsByStage = await fetchLeadsByStage(companySlug);
	const total = leadsByStage.reduce((sum, stage) => sum + stage.count, 0);

	return (
		<div className="overflow-hidden rounded-lg bg-white shadow">
			<div className="border-b border-gray-200 px-6 py-4">
				<h3 className="text-lg font-semibold text-gray-900">Leads por Estágio</h3>
			</div>
			<div className="p-6">
				<div className="space-y-4">
					{leadsByStage.map((stage) => {
						const percentage = total > 0 ? (stage.count / total) * 100 : 0;
						return (
							<div key={stage.stage}>
								<div className="mb-2 flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700">{stage.stage}</span>
									<span className="text-sm font-semibold text-gray-900">{stage.count}</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-gray-200">
									<div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: \`\${percentage}%\` }} />
								</div>
							</div>
						);
					})}
				</div>
				{leadsByStage.length === 0 && (
					<p className="py-8 text-center text-gray-500">Nenhum lead cadastrado ainda</p>
				)}
			</div>
		</div>
	);
}
`,

	'nextjs/src/components/admin/dashboard/RecentActivities.tsx': `import { fetchRecentActivities } from '@/lib/directus/realEstate';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, Mail, Calendar, MessageSquare } from 'lucide-react';

const activityIcons = {
	call: Phone,
	email: Mail,
	meeting: Calendar,
	message: MessageSquare,
};

export async function RecentActivities({ companySlug }: { companySlug: string }) {
	const activities = await fetchRecentActivities(companySlug);

	return (
		<div className="overflow-hidden rounded-lg bg-white shadow">
			<div className="border-b border-gray-200 px-6 py-4">
				<h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
			</div>
			<div className="divide-y divide-gray-200">
				{activities.map((activity: any) => {
					const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || MessageSquare;
					const timeAgo = formatDistanceToNow(new Date(activity.date_created), {
						addSuffix: true,
						locale: ptBR,
					});

					return (
						<div key={activity.id} className="px-6 py-4">
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
										<Icon className="h-5 w-5 text-blue-600" />
									</div>
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-900">{activity.subject}</p>
									{activity.description && (
										<p className="mt-1 text-sm text-gray-600">{activity.description}</p>
									)}
									<p className="mt-1 text-xs text-gray-500">{timeAgo}</p>
								</div>
							</div>
						</div>
					);
				})}
				{activities.length === 0 && (
					<div className="px-6 py-8 text-center text-gray-500">Nenhuma atividade recente</div>
				)}
			</div>
		</div>
	);
}
`,

	'nextjs/src/components/admin/dashboard/FeaturedProperties.tsx': `import Link from 'next/link';
import { DirectusImage } from '@/components/shared/DirectusImage';
import { fetchProperties, getCoverImageId } from '@/lib/directus/realEstate';

export async function FeaturedProperties({ companySlug }: { companySlug: string }) {
	const properties = await fetchProperties({ companySlug, featuredOnly: true, limit: 6 });

	return (
		<div className="overflow-hidden rounded-lg bg-white shadow">
			<div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
				<h3 className="text-lg font-semibold text-gray-900">Imóveis em Destaque</h3>
				<Link href="/admin/properties" className="text-sm font-medium text-blue-600 hover:text-blue-700">
					Ver todos
				</Link>
			</div>
			<div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
				{properties.map((property: any) => {
					const price = property.transaction_type === 'rent' ? property.price_rent : property.price_sale;
					const coverImageId = getCoverImageId(property);

					return (
						<Link
							key={property.id}
							href={\`/admin/properties/\${property.id}\`}
							className="group overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
						>
							<div className="relative aspect-video overflow-hidden bg-gray-200">
								{coverImageId && (
									<DirectusImage
										id={coverImageId}
										alt={property.title}
										width={400}
										height={300}
										className="h-full w-full object-cover transition-transform group-hover:scale-105"
									/>
								)}
							</div>
							<div className="p-4">
								<h4 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">{property.title}</h4>
								<p className="mb-2 text-xs text-gray-600">
									{property.neighborhood}, {property.city}
								</p>
								<p className="text-lg font-bold text-blue-600">
									{price
										? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
										: 'Sob consulta'}
								</p>
							</div>
						</Link>
					);
				})}
				{properties.length === 0 && (
					<div className="col-span-full py-12 text-center text-gray-500">Nenhum imóvel em destaque</div>
				)}
			</div>
		</div>
	);
}
`,
};

// Criar todos os arquivos
Object.entries(files).forEach(([filePath, content]) => {
	const fullPath = path.join(__dirname, filePath);
	fs.writeFileSync(fullPath, content, 'utf8');
	console.log(`✅ Criado: ${filePath}`);
});

console.log('\n✅ Estrutura do painel administrativo criada com sucesso!');
console.log('\n📌 Próximos passos:');
console.log('   1. Acesse http://localhost:3000/admin/dashboard');
console.log('   2. Verifique se o Directus está rodando em http://localhost:8055');
console.log('   3. Adicione ?company=exclusiva na URL para filtrar dados\n');
