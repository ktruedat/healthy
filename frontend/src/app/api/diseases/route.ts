import { NextResponse } from 'next/server';
import { diseaseService } from '@/services';
import { ApiError } from '@/services/api-client';

export async function GET(request: Request) {
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc';
  
  try {
    // Map the request parameters to the service parameters
    const filters = {
      offset: page * limit,
      limit,
      search,
      sortBy,
      sortOrder,
    };
    
    // Call the actual API using the disease service
    const response = await diseaseService.getDiseases(filters);
    
    // The response is already in the correct format from our backend
    // No need to transform it further
    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error('Error fetching diseases:', error);
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
