import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get all requests for a project (project owner only)
export async function GET(
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // check if the user is the project owner
    const project = await prisma.project.findUnique({
      where: { id: id },
      select: { ownerId: true }
    })

    if (!project || project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const requests = await prisma.projectRequest.findMany({
      where: { 
        projectId: id,
        status: 'PENDING' // only show pending requests
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(requests)
  } catch (error: any) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Submit a join request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

    const MAX_MESSAGE_LENGTH = 100;
    if (message && message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // Check if project exists and has spots available
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            members: { where: { status: 'ACTIVE' } }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.ownerId === user.id) {
      return NextResponse.json({ error: 'Cannot request to join your own project' }, { status: 400 })
    }

    const currentMemberCount = project._count.members
    if (currentMemberCount >= project.teamSize) {
      return NextResponse.json({ error: 'Project team is full' }, { status: 400 })
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: id  //project ID from params
        }
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this project' }, { status: 400 })
    }

    // Create the request
    const projectRequest = await prisma.projectRequest.create({
      data: {
        projectId: id,
        userId: user.id,
        message: message || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            skills: true,
          }
        },
        project: {
          select: {
            title: true,
            owner: {
              select: { name: true }
            }
          }
        }
      }
    })

    return NextResponse.json(projectRequest, { status: 201 })
  } catch (error: any) {
  
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Request already exists' }, { status: 400 })
    }
    console.error('Error creating request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
