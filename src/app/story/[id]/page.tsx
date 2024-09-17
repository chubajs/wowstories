import { Metadata } from 'next';
import StoryContent from './StoryContent';

interface Story {
  id: string;
  title: string;
  content: string;
  number: number;
  createdAt: string;
  model: string;
}

async function getStoryById(id: string): Promise<Story | null> {
  const res = await fetch(`${process.env.SITE_URL}/api/getStory/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const story = await getStoryById(params.id);

  if (!story) {
    return {
      title: 'История не найдена | Офигенные истории',
      description: 'Запрошенная история не найдена.',
    };
  }

  return {
    title: story.title ? `${story.title} | Офигенные истории` : 'История | Офигенные истории',
    description: story.content ? `${story.content.slice(0, 150)}...` : 'Прочитайте уникальную историю, созданную с помощью искусственного интеллекта.',
    openGraph: {
      title: story.title ? `${story.title} | Офигенные истории` : 'История | Офигенные истории',
      description: story.content ? `${story.content.slice(0, 150)}...` : 'Прочитайте уникальную историю, созданную с помощью искусственного интеллекта.',
      images: [
        {
          url: '/img/istorii.png',
          alt: 'Офигенные истории - логотип',
        },
      ],
      url: `${process.env.SITE_URL}/story/${story.id}`,
      siteName: 'Офигенные истории',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title ? `${story.title} | Офигенные истории` : 'История | Офигенные истории',
      description: story.content ? `${story.content.slice(0, 150)}...` : 'Прочитайте уникальную историю, созданную с помощью искусственного интеллекта.',
      images: ['/img/istorii.png'],
    },
  };
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStoryById(params.id);

  if (!story) {
    return <div>История не найдена</div>;
  }

  return <StoryContent story={story} />;
}