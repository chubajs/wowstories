import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { title, content, prompt, model } = await req.json();

    // Получаем максимальный номер истории
    const maxNumber = await prisma.story.aggregate({
      _max: {
        number: true,
      },
    });

    // Генерируем следующий номер
    const nextNumber = (maxNumber._max.number || 0) + 1;

    const story = await prisma.story.create({
      data: {
        title,
        content,
        prompt,
        model,
        number: nextNumber,
      },
    });

    return NextResponse.json({
      id: story.id,
      number: story.number,
      createdAt: story.createdAt,
      model: story.model
    });
  } catch (error) {
    console.error('Failed to save story:', error);
    return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
  }
}