import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase-server';

const prisma = new PrismaClient();
// GET /api/me/requests/sent
// Fetches all requests made by the current user.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sentRequests = await prisma.projectRequest.findMany({
      where: { userId: user.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sentRequests);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
