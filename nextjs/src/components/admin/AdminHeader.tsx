'use client';

import { Bell, Search, User } from 'lucide-react';

export function AdminHeader() {
	return (
		<header className="flex h-16 items-center justify-between border-b-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6">
			<div className="flex flex-1 items-center">
				<div className="relative w-96">
					<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
					<input
						type="text"
						placeholder="Buscar imóveis, leads, clientes..."
						className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 pl-10 pr-4 text-sm placeholder:text-gray-600 dark:placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			<div className="flex items-center space-x-4">
				<button className="relative rounded-lg p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
					<Bell className="h-6 w-6" />
					<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
				</button>

				<div className="flex items-center space-x-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-3 py-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
						<User className="h-5 w-5" />
					</div>
					<div className="text-sm">
						<p className="font-medium text-gray-900 dark:text-gray-100">Admin</p>
						<p className="text-gray-700 dark:text-gray-300">Imobiliária Exclusiva</p>
					</div>
				</div>
			</div>
		</header>
	);
}
