import { NextResponse } from 'next/server';

// Version is defined at build time from package.json
const APP_VERSION = '1.0.0';

/**
 * Health check endpoint for load balancer and monitoring
 * GET /api/health
 */
export async function GET() {
	const healthStatus = {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		version: APP_VERSION,
		environment: process.env.NODE_ENV || 'development',
	};

	return NextResponse.json(healthStatus, { status: 200 });
}
