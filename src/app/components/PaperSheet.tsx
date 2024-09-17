import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PaperSheetProps {
  onGenerateStory: (story: string) => void;
}

interface StoryInfo {
  number: number;
  createdAt: string;
  model: string;
}

const PaperSheet: React.FC<PaperSheetProps> = ({ onGenerateStory }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyInfo, setStoryInfo] = useState<StoryInfo | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      setIsGenerating(true);
      setGeneratedStory('');
      setStoryInfo(null);

      const response = await fetch('/api/generateStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        console.error('Failed to generate story');
        setIsGenerating(false);
        return;
      }

      const model = response.headers.get('X-Model') || 'Unknown';

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let fullStory = '';
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || '';
              fullStory += content;
              setGeneratedStory(fullStory);
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }

      setIsGenerating(false);
      onGenerateStory(fullStory);

      // Сохраняем историю
      const saveResponse = await fetch('/api/saveStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: prompt,
          content: fullStory,
          prompt,
          model,
        }),
      });

      if (saveResponse.ok) {
        const savedStory = await saveResponse.json();
        setStoryInfo({
          number: savedStory.number,
          createdAt: new Date(savedStory.createdAt).toLocaleString(),
          model: savedStory.model,
        });
      } else {
        console.error('Failed to save story');
      }
    }
  };

  useEffect(() => {
    if (storyRef.current) {
      storyRef.current.scrollTop = storyRef.current.scrollHeight;
    }
  }, [generatedStory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-yellow-50 p-6 rounded-lg shadow-md max-w-2xl w-full"
    >
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Введите подсказку для истории..."
          className="w-full h-32 p-2 mb-4 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          disabled={isGenerating}
        >
          {isGenerating ? 'Генерация...' : 'Создать историю'}
        </button>
      </form>
      {generatedStory && (
        <div className="mt-4">
          {storyInfo && (
            <div className="mb-2 text-sm text-gray-600">
              История #{storyInfo.number} | Создана: {storyInfo.createdAt} | Модель: {storyInfo.model}
            </div>
          )}
          <div
            ref={storyRef}
            className="p-4 bg-white rounded shadow-inner h-64 overflow-y-auto"
          >
            <p className="whitespace-pre-wrap">{generatedStory}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaperSheet;