'use client';

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
		<aside className="w-64 border-r-2 border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700">
			<div className="flex h-16 items-center border-b-2 border-gray-300 dark:border-gray-700 px-6">
				<Building2 className="h-8 w-8 text-blue-600" />
				<span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">IMOBI</span>
			</div>

			<nav className="space-y-1 p-4">
				{menuItems.map((item) => {
					const isActive = pathname.startsWith(item.href);
					const Icon = item.icon;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
								isActive
									? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
									: 'text-gray-800 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'
							}`}
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
