import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase-server';
import { MemberStatus } from '@prisma/client';

const prisma = new PrismaClient();

const projectIncludes = {
  owner: {
    select: {
      id: true,
      name: true
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
  members: { 
    select: {
      userId: true 
    }, 
    where: { 
      status: MemberStatus.ACTIVE 
    } 
  },
  requests: { 
    select: { 
      userId: true, 
      status: true 
    } 
  },
  _count: {
    select: {
      members: {
        where: { 
          status: MemberStatus.ACTIVE 
        } 
      } 
    } 
  },
};

// GET /api/me/projects
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // Fetch projects owned by the user
    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      include: projectIncludes,
      orderBy: {
        createdAt: 'desc'
      },
    });

    // Fetch projects where the user is a member
    const memberProjects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            status: MemberStatus.ACTIVE,
          },
        },
      },
      include: projectIncludes,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      ownedProjects: ownedProjects,
      memberProjects: memberProjects,
    });

  } catch (error) {
    console.error('Error fetching user projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
