import { NextResponse } from 'next/server';

/**
 * Health check endpoint for load balancer and monitoring
 * GET /api/health
 */
export async function GET() {
	const healthStatus = {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		version: process.env.npm_package_version || '1.0.0',
		environment: process.env.NODE_ENV || 'development',
	};

	return NextResponse.json(healthStatus, { status: 200 });
}
