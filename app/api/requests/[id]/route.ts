import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase-server'
const prisma = new PrismaClient();
// PATCH - Approve/reject a request
export async function PATCH(
    request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the request with project info
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            _count: {
              select: {
                members: { 
                  where: { 
                    status: 'ACTIVE' 
                  } 
                }
              }
            }
          }
        }
      }
    })

    if (!projectRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Check if user owns the project
    if (projectRequest.project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (projectRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    if (action === 'approve') {
      // check if project still has space for new members
      const currentMembers = projectRequest.project._count.members
      if (currentMembers >= projectRequest.project.teamSize) {
        return NextResponse.json({ error: 'Project team is full' }, { status: 400 })
      }

      // transaction is used to ensure consistency - we want both request status to be updated and 
      // member to be added. If one fails, both should fail.
      const result = await prisma.$transaction(async (tx) => {
        // Update request status to approved
        const updatedRequest = await tx.projectRequest.update({
          where: { id: params.id },
          data: { status: 'APPROVED', updatedAt: new Date() }
        })

        // add the user to project members
        await tx.projectMember.create({
          data: {
            userId: projectRequest.userId,
            projectId: projectRequest.projectId,
            status: 'ACTIVE'
          }
        })

        return updatedRequest
      })

      return NextResponse.json(result)
    } else {
      // reject request
      const updatedRequest = await prisma.projectRequest.update({
        where: { id: params.id },
        data: { status: 'REJECTED', updatedAt: new Date() }
      })

      return NextResponse.json(updatedRequest)
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Withdraw a request (by requester)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: params.id }
    })

    if (!projectRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (projectRequest.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (projectRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Can only withdraw pending requests' }, { status: 400 })
    }

    await prisma.projectRequest.update({
      where: { id: params.id },
      data: { status: 'WITHDRAWN' }
    })

    return NextResponse.json({ message: 'Request withdrawn' })
  } catch (error) {
    console.error('Error withdrawing request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
