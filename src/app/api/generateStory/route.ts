import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || 'https://wow.bulaev.ai';
const SITE_NAME = 'wowStories';
const MODEL = 'mistralai/pixtral-12b:free';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

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
        { role: 'system', content: 'Вы - креативный писатель, который создает короткие, увлекательные истории на основе подсказок пользователей. Используйте переносы строк для разделения абзацев.' },
        { role: 'user', content: 'Напиши интересную историю на тему: ' + prompt + ' \n\n не забудь про юмор.' },
      ],
      stream: true,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
  }

  // Преобразуем поток в ReadableStream
  const stream = response.body;
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Model': MODEL,
    },
  });
}