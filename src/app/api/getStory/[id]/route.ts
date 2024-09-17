import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Story {
  id: string;
  title: string;
  content: string;
  number: number;
  createdAt: string;
  model: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<Story | { error: string }>> {
  const id = params.id;

  try {
    const story = await prisma.story.findUnique({
      where: { id: id },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const typedStory: Story = {
      ...story,
      createdAt: story.createdAt.toISOString(),
    };

    return NextResponse.json(typedStory);
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}