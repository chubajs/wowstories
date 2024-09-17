import { Metadata } from 'next';
import StoryContent from './StoryContent';

export const metadata: Metadata = {
  title: 'История | Офигенные истории',
  description: 'Прочитайте уникальную историю, созданную с помощью искусственного интеллекта.',
  openGraph: {
    title: 'История | Офигенные истории',
    description: 'Прочитайте уникальную историю, созданную с помощью искусственного интеллекта.',
    images: ['/img/istorii.png'],
  },
};

export default function StoryPage() {
  return <StoryContent />;
}