import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'



export async function GET() {
  try {
    const technologies = await prisma.technology.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(technologies)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch technologies' }, { status: 500 })
  }
}
