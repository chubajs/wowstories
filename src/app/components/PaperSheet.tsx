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
  const [userInput, setUserInput] = useState('');
  const [displayContent, setDisplayContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [storyInfo, setStoryInfo] = useState<StoryInfo | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (userInput.trim() && !isGenerating) {
      const prompt = userInput;
      setIsGenerating(true);
      setIsErasing(true);

      // Анимация стирания
      for (let i = userInput.length; i >= 0; i--) {
        setDisplayContent(userInput.slice(0, i));
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      setIsErasing(false);
      setUserInput('');

      try {
        const response = await fetch('/api/generateStory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate story');
        }

        const model = response.headers.get('X-Model') || 'Unknown';

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        let generatedStory = '';
        setDisplayContent('');

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const newContent = data.choices[0]?.delta?.content || '';
                generatedStory += newContent;
                setDisplayContent((prev) => prev + newContent);
                await new Promise((resolve) => setTimeout(resolve, 10));
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
            }
          }
        }

        onGenerateStory(generatedStory);

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
          throw new Error('Failed to save story');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayContent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleNewStory = () => {
    setDisplayContent('');
    setStoryInfo(null);
    setUserInput('');
  };

  const Cursor = () => (
    <motion.span
      className="inline-block bg-blue-500"
      style={{ width: '10px', height: '1em', marginLeft: '2px' }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {storyInfo && (
        <>
          <button
            onClick={handleNewStory}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-neucha"
          >
            Новая история
          </button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-2 bg-gray-100 rounded text-sm text-gray-600 flex justify-between items-center font-jetbrains-mono"
          >
            <span>#{storyInfo.number}</span>
            <span>{storyInfo.createdAt}</span>
            <span>{storyInfo.model}</span>
          </motion.div>
        </>
      )}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-md font-neucha"
        style={{ minHeight: '300px' }}
      >
        {!isGenerating && !isErasing && !storyInfo && (
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full border-none resize-none focus:outline-none bg-transparent font-neucha"
            style={{
              padding: '8px 10px',
              fontSize: '16px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
            }}
            placeholder="Введите подсказку для истории и нажмите Enter..."
          />
        )}
        {(isGenerating || isErasing || displayContent) && (
          <div
            ref={contentRef}
            className="w-full h-full whitespace-pre-wrap break-words font-neucha"
            style={{
              padding: '8px 10px',
              fontSize: '16px',
              lineHeight: '1.5',
              overflowWrap: 'break-word',
              overflowY: 'auto',
            }}
          >
            {displayContent}
            {(isGenerating || isErasing) && <Cursor />}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaperSheet;
