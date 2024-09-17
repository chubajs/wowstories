import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaperSheetProps {
  onGenerateStory: (story: string) => void;
}

interface StoryInfo {
  number: number;
  createdAt: string;
  model: string;
}

const PaperSheet: React.FC<PaperSheetProps> = ({ onGenerateStory }) => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyInfo, setStoryInfo] = useState<StoryInfo | null>(null);
  const [isErasing, setIsErasing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (content.trim() && !isGenerating) {
      const prompt = content;
      setIsGenerating(true);
      setIsErasing(true);

      // Анимация стирания
      for (let i = content.length; i >= 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 20));
        setContent(content.slice(0, i));
      }
      setIsErasing(false);

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

      let generatedStory = '';
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
              generatedStory += content;
              setContent(generatedStory);
              await new Promise(resolve => setTimeout(resolve, 10)); // Небольшая задержка для эффекта печатания
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }

      setIsGenerating(false);
      onGenerateStory(generatedStory);

      // Сохраняем историю
      const saveResponse = await fetch('/api/saveStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: prompt,
          content: generatedStory,
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {storyInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-2 bg-gray-100 rounded text-sm text-gray-600"
        >
          История #{storyInfo.number} | Создана: {storyInfo.createdAt} | Модель: {storyInfo.model}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden"
        style={{ minHeight: '300px' }}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => !isGenerating && setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder={isGenerating ? '' : "Введите подсказку для истории и нажмите Enter..."}
          className="w-full h-full p-2 border-none resize-none focus:outline-none bg-transparent"
          disabled={isGenerating}
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #ccc 31px, #ccc 32px)',
            lineHeight: '32px',
            padding: '8px 10px',
          }}
        />
        <AnimatePresence>
          {isErasing && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: '0%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PaperSheet;