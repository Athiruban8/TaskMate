import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'



async function assertIsProjectMemberOrOwner(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, members: { where: { status: 'ACTIVE' }, select: { userId: true } } }
  })
  if (!project) return false
  if (project.ownerId === userId) return true
  return project.members.some(m => m.userId === userId)
}

// GET /api/projects/[id]/messages
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowed = await assertIsProjectMemberOrOwner(user.id, id)
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const messages = await prisma.message.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    const result = messages.map(m => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      user: { id: m.userId, name: m.user.name ?? m.user.email }
    }))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects/[id]/messages
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowed = await assertIsProjectMemberOrOwner(user.id, id)
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { content } = await request.json()
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const created = await prisma.message.create({
      data: { content, projectId: id, userId: user.id },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    return NextResponse.json({
      id: created.id,
      content: created.content,
      createdAt: created.createdAt,
      user: { id: created.userId, name: created.user.name ?? created.user.email }
    })
  } catch (error: any) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


