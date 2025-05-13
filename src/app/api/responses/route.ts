// app/api/posts/route.ts
import { prisma } from '../../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const data = await req.json()

  const post = await prisma.post.create({
    data: {
      userId: data.userId,
      auth_id: data.auth_id,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      inquiryType: data.inquiryType,
      inquirerName: data.inquirerName,
      inquirerGender: data.inquirerGender,
      inquirerPhone: data.inquirerPhone,
      inquirerRelationship: data.inquirerRelationship,
      inquirerRelationshipOther: data.inquirerRelationshipOther,
      category: data.category,
    },
  })

  return NextResponse.json(post)
}
