import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/projects - Get all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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
    })
    
    return NextResponse.json(projects)
  } catch (err: any) {
    console.error('Error fetching projects:', err)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { 
      title, 
      description, 
      city, 
      teamSize, 
      ownerId, 
      technologyIds = [], 
      categoryIds = [], 
      industryIds = [] 
    } = data

    // Validation
    if (!title || !description || !ownerId) {
      return NextResponse.json(
        { error: 'Title, description, and ownerId are required' },
        { status: 400 }
      )
    }

    if (!teamSize || teamSize < 1) {
      return NextResponse.json(
        { error: 'Team size must be at least 1' },
        { status: 400 }
      )
    }

    if (!Array.isArray(technologyIds) || technologyIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one technology must be selected' },
        { status: 400 }
      )
    }

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one category must be selected' },
        { status: 400 }
      )
    }

    // Create project with all relationships
    const project = await prisma.project.create({
      data: {
        title,
        description,
        city,
        teamSize: teamSize,
        ownerId,
        // Create technology relationships
        technologies: {
          create: technologyIds.map((techId: string) => ({
            technology: {
              connect: { id: techId }
            }
          }))
        },
        // Create category relationships
        categories: {
          create: categoryIds.map((catId: string) => ({
            category: {
              connect: { id: catId }
            }
          }))
        },
        // Create industry relationships (optional)
        industries: {
          create: industryIds.map((indId: string) => ({
            industry: {
              connect: { id: indId }
            }
          }))
        }
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
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (err: any) {
    console.error('Error creating project:', err)

    // Error handling
    if (err.code === 'P2003') { // if foreign key constraint failed
        return NextResponse.json(
          { error: 'Invalid technology, category, or industry selected' },
           { status: 400 }
          )
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}