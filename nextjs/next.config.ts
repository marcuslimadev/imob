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
	webpack: (config) => {
		config.cache = false;

		return config;
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
