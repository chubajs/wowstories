"use client";

import Image from 'next/image';
import PaperSheet from './components/PaperSheet';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-start py-8 px-4">
      <Image
        src="/img/istorii.png"
        alt="Офигенные истории - логотип"
        width={300}
        height={100}
        priority
        className="mb-8"
      />
      <PaperSheet onGenerateStory={() => {}} />
      <Footer />
    </div>
  );
}