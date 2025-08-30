import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase-server';

const prisma = new PrismaClient();

// GET /api/me/requests/incoming
// Fetches all pending requests for projects owned by the current user.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectsWithRequests = await prisma.project.findMany({
      where: {
        ownerId: user.id,
        requests: {
          some: {
            status: 'PENDING',
          },
        },
      },
      select: {
        id: true,
        title: true,
        requests: {
          where: { status: 'PENDING' },
          include: {
            user: {
              select: { id: true, name: true, email: true, skills: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json(projectsWithRequests);
  } catch (error) {
    console.error('Error fetching incoming requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
