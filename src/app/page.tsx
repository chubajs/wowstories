import { Metadata } from 'next';
import HomePage from './HomePage';

export const metadata: Metadata = {
  title: 'Офигенные истории - Генератор уникальных историй',
  description: 'Создавайте уникальные истории с помощью искусственного интеллекта. Генерируйте, сохраняйте и делитесь своими историями.',
  openGraph: {
    title: 'Офигенные истории - Генератор уникальных историй',
    description: 'Создавайте уникальные истории с помощью искусственного интеллекта.',
    images: ['/img/istorii.png'],
  },
};

export default function Page() {
  return <HomePage />;
}
