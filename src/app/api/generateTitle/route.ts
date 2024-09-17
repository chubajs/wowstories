import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || 'https://wow.bulaev.ai';
const SITE_NAME = 'wowStories';
const MODEL = 'mistralai/pixtral-12b:free';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { story } = await req.json();

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': SITE_URL,
      'X-Title': SITE_NAME,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Вы - креативный писатель, который придумывает короткие и интересные названия для историй.' },
        { role: 'user', content: `Придумайте короткое и интересное название для следующей истории, ответь только названием, без объяснений, без вариантов: ${story.substring(0, 500)}...` },
      ],
      max_tokens: 30,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 });
  }

  const data = await response.json();
  const title = data.choices[0].message.content.trim();

  return NextResponse.json({ title });
}