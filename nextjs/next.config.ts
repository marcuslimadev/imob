import type { NextConfig } from 'next';
import initializeBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = initializeBundleAnalyzer({
	enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true',
});

const ContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    frame-src *;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src * blob: data:;
    media-src *;
    connect-src *;
    font-src 'self' data: https://fonts.gstatic.com;
    frame-ancestors 'self' http://localhost:3000 ${process.env.NEXT_PUBLIC_DIRECTUS_URL};
`;

const nextConfig: NextConfig = {
	webpack: (config, { isServer }) => {
		config.cache = false;
		// Reduzir uso de memória
		config.optimization = {
			...config.optimization,
			minimize: false,
		};
		// Desabilitar watchpack em desenvolvimento
		if (!isServer) {
			config.watchOptions = {
				poll: 3000,
				aggregateTimeout: 300,
				ignored: /node_modules|\.next/,
			};
		}
		return config;
	},
	// Otimizações para reduzir uso de memória
	experimental: {
		webpackMemoryOptimizations: true,
	},
	// Configuração para rodar na porta 4000
	serverRuntimeConfig: {
		port: 4000,
	},
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: process.env.NEXT_PUBLIC_DIRECTUS_URL?.split('//')[1] || '',
				pathname: '/assets/**',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8055',
				pathname: '/assets/**',
			},
			{
				protocol: 'http',
				hostname: 'directus',
				port: '8055',
				pathname: '/assets/**',
			},
		],
	},
	env: {
		DIRECTUS_ADMIN_TOKEN: process.env.DIRECTUS_ADMIN_TOKEN,
	},
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Content-Security-Policy',
						value: ContentSecurityPolicy.replace(/\n/g, '').trim(),
					},
				],
			},
		];
	},
};

export default withBundleAnalyzer(nextConfig);
