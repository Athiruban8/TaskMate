import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    
    const project = await prisma.project.findUnique({
      where: {
        id: id
      },
      include: {
        owner: {
          select: { 
            id: true,
            name: true, 
            email: true 
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
          where: { 
            status: 'ACTIVE' 
          },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: {
            members: { where: { status: 'ACTIVE' } }
          }
        },
        requests: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
      }
    })
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // flatten the many-to-many relationships for easier use on the client
    const formattedProject = {
      ...project,
      technologies: project.technologies.map(t => t.technology),
      categories: project.categories.map(c => c.category),
      industries: project.industries.map(i => i.industry),
    };

    
    return NextResponse.json(formattedProject)
  } catch (err) {
    console.error('Error fetching project:', err)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

// PUT /api/projects/[id] - Update a project and its relations
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const { 
        title, 
        description, 
        city, 
        teamSize, 
        technologyIds, // an array of technology IDs
        categoryIds,   // an array of category IDs
        industryIds    // an array of industry IDs
    } = data

    // validation
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.update({
      where: {
        id: id
      },
      data: {
        title,
        description,
        city,
        teamSize,
        // Update many-to-many relationships
        // The `set` operator disconnects all existing relations and connects the new ones.
        technologies: technologyIds ? {
          set: technologyIds.map((id: string) => ({ technologyId: id }))
        } : undefined,
        categories: categoryIds ? {
          set: categoryIds.map((id: string) => ({ categoryId: id }))
        } : undefined,
        industries: industryIds ? {
          set: industryIds.map((id: string) => ({ industryId: id }))
        } : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        technologies: { include: { technology: true } },
        categories: { include: { category: true } },
        industries: { include: { industry: true } },
      }
    })

    //flatten the response for consistency 
    const formattedProject = {
        ...project,
        technologies: project.technologies.map(t => t.technology),
        categories: project.categories.map(c => c.category),
        industries: project.industries.map(i => i.industry),
    };

    return NextResponse.json(formattedProject)
  } catch (err) {
    console.error('Error updating project:', err)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    await prisma.project.delete({
      where: {
        id: id
      }
    })
    
    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (err) {
    console.error('Error deleting project:', err)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
