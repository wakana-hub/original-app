// src/app/api/lists/route.ts
import { NextResponse } from "next/server";
import supabase from "../../../utils/supabase/supabaseServerClient";
import { PrismaClient, InquiryType } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET() {
  const { data, error } = await supabase.from("post").select(`
      id,
      startTime,
      status,
      inquiryType,
      category,
      message,
      user (
        name
      )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      startTime,
      endTime,
      status,
      inquiryType,
      category,
      message,
      inquirerName,
      inquirerGender,
      inquirerPhone,
      inquirerRelationship,
      inquirerRelationshipOther,
      remarks,
      auth_id,
      updated_at,
    } = body;

    if (!auth_id) {
      return NextResponse.json(
        { success: false, error: "ユーザーIDがありません" },
        { status: 400 }
      );
    }

    if (!Object.values(InquiryType).includes(inquiryType)) {
      return NextResponse.json(
        { success: false, error: "inquiryTypeの値が不正です" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { auth_id } });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "該当するユーザーが存在しません" },
        { status: 404 }
      );
    }

    // post 作成（userと紐付け + user.name も含めて返す）
    const newPost = await prisma.post.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
        inquiryType,
        category,
        message,
        inquirerName: inquirerName || null,
        inquirerGender: inquirerGender || null,
        inquirerPhone: inquirerPhone || null,
        inquirerRelationship: inquirerRelationship || null,
        inquirerRelationshipOther: inquirerRelationshipOther || null,
        remarks: remarks || null,
        auth_id,
        updatedAt: null,
        user: {
          connect: { id: user.id },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            auth_id: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (error) {
    console.error("[POST ERROR]", error);
    return NextResponse.json(
      { success: false, error: "登録に失敗しました" },
      { status: 500 }
    );
  }
}
