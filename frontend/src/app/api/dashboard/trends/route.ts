import { NextResponse } from 'next/server';
import { dashboardService } from '@/services';
import { ApiError } from '@/services/api-client';

export async function GET() {
  try {
    const response = await dashboardService.getDashboardTrends();
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching trends:', error);
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
