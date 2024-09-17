import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || 'https://wow.bulaev.ai';
const SITE_NAME = 'wowStories';
// Define an array of available models
const MODELS = [
  'sao10k/fimbulvetr-11b-v2',
  'meta-llama/llama-3-70b-instruct',
  'microsoft/wizardlm-2-8x22b',
  'sophosympatheia/midnight-rose-70b',
  'anthropic/claude-3-haiku',
  'nousresearch/nous-hermes-yi-34b',
  'openchat/openchat-7b',
  'mattshumer/reflection-70b',
  'jondurbin/airoboros-l2-70b',
  'perplexity/llama-3.1-sonar-large-128k-chat',
  'openai/gpt-4o-mini-2024-07-18',
  'google/gemma-2-27b-it',
];

// Function to select a random model
const getRandomModel = (): string => {
  const randomIndex = Math.floor(Math.random() * MODELS.length);
  return MODELS[randomIndex];
};

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not defined.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // Select a random model
    const MODEL = getRandomModel();
    
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
          { role: 'user', content: 'Напиши интересную историю на тему: ' + prompt + ' \n\n не забудь про юмор. Ответь только историей, без объяснений и комментариев. Используй букву ё, если в тексте есть буква ё, а не е.' },
        ],
        stream: true,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to generate story', details: errorText }, { status: 500 });
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
  } catch (error) {
    console.error('Unexpected Error in generateStory route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}