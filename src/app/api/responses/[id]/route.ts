// app/api/posts/[id]/route.ts
import { prisma } from '../../../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: Number(params.id) },
    include: { user: true },
  })

  if (!post) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()

  const updated = await prisma.post.update({
    where: { id: Number(params.id) },
    data: {
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

  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.post.delete({
    where: { id: Number(params.id) },
  })

  return NextResponse.json({ message: 'Deleted successfully' })
}
