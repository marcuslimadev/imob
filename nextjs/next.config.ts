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
	output: 'standalone',
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	webpack: (config) => {
		config.cache = false;

		return config;
	},
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8055',
				pathname: '/assets/**',
			},
			// Add AWS ALB pattern for production
			{
				protocol: 'http',
				hostname: '*.elb.amazonaws.com',
				pathname: '/assets/**',
			},
			// Add any custom domain
			...(process.env.NEXT_PUBLIC_DIRECTUS_URL?.split('//')[1] ? [{
				protocol: 'https' as const,
				hostname: process.env.NEXT_PUBLIC_DIRECTUS_URL.split('//')[1].split(':')[0],
				pathname: '/assets/**',
			}] : []),
		],
	},
	env: {
		DIRECTUS_ADMIN_TOKEN: process.env.DIRECTUS_ADMIN_TOKEN,
		NEXT_PUBLIC_BUILD_VERSION: process.env.npm_package_version || '1.0.0',
		NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
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
