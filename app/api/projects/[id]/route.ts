import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (err) {
    console.error('Error fetching project:', err)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { title, description } = data

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.update({
      where: {
        id: params.id
      },
      data: {
        title,
        description,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(project)
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
    await prisma.project.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (err) {
    console.error('Error deleting project:', err)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
