import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const industries = await prisma.industry.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(industries)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch industries' }, { status: 500 })
  }
}
