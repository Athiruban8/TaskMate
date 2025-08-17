import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase-server';

const prisma = new PrismaClient();

// GET /api/users/me/projects
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch projects owned by the user
    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: user?.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        technologies: {
          include: {
            technology: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        industries: {
          include: {
            industry: true
          }
        },
        members: {
          where: { status: 'ACTIVE' },
          select: { userId: true }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        },
        requests: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    // Fetch projects where the user is a member
    const memberProjects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        technologies: {
          include: {
            technology: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        industries: {
          include: {
            industry: true
          }
        },
        members: {
          where: { status: 'ACTIVE' },
          select: { userId: true }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        },
        requests: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Flatten the nested data for easier use on the client
    const formatProjects = (projects: any[]) => projects.map(p => ({
        ...p,
        technologies: p.technologies.map((t: any) => t.technology)
    }));

    return NextResponse.json({
      ownedProjects: formatProjects(ownedProjects),
      memberProjects: formatProjects(memberProjects),
    });

  } catch (error) {
    console.error('Error fetching user projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
