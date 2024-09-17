"use client";

import { useState } from 'react';
import PaperSheet from './components/PaperSheet';
import Footer from './components/Footer';

export default function Home() {
  const [generatedStory, setGeneratedStory] = useState('');

  const handleGenerateStory = async (prompt: string) => {
    // Здесь будет логика для вызова API и генерации истории
    // Пока что просто имитируем задержку и устанавливаем фиктивный текст
    await new Promise(resolve => setTimeout(resolve, 1000));
    setGeneratedStory(`Сгенерированная история на основе промпта: "${prompt}"`);
  };

  return (
    <div className="flex flex-col items-center justify-start py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Офигенные истории</h1>
      <PaperSheet onGenerateStory={handleGenerateStory} />
      {generatedStory && (
        <div className="mt-8 p-4 bg-white rounded shadow-md max-w-2xl w-full">
          <h2 className="text-xl font-semibold mb-2">Сгенерированная история:</h2>
          <p>{generatedStory}</p>
        </div>
      )}
      <Footer />
    </div>
  );
}