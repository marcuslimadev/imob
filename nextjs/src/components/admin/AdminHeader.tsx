'use client';

import { Bell, Search, User } from 'lucide-react';

export function AdminHeader() {
        return (
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
                        <div className="flex flex-1 items-center">
                                <div className="relative w-96">
                                        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                                type="text"
                                                placeholder="Buscar imóveis, leads, clientes..."
                                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                </div>
                        </div>

                        <div className="flex items-center space-x-4">
                                <button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
                                        <Bell className="size-6" />
                                        <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500" />
                                </button>

                                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 px-3 py-2">
                                        <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-white">
                                                <User className="size-5" />
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
