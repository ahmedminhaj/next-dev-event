import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Event, { IEvent } from '@/database/event.model';

// Route params type for dynamic [slug] route
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 * @param request - Next.js request object (unused but required for signature)
 * @param context - Route context containing dynamic params
 * @returns JSON response with event data or error message
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectToDatabase();

    // Validate slug parameter exists
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Slug parameter is required' 
        },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric and hyphens only)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens' 
        },
        { status: 400 }
      );
    }

    // Query event by slug
    const event: IEvent | null = await Event.findOne({ slug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { 
          success: false,
          message: `Event with slug "${slug}" not found` 
        },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      {
        success: true,
        message: 'Event fetched successfully',
        event,
      },
      { status: 200 }
    );

  } catch (error) {
    // Log error for debugging (server-side only)
    console.error('Error fetching event by slug:', error);

    // Return generic error response without exposing internal details
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching the event',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
