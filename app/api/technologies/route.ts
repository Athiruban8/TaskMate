import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

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
