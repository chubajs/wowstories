import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiCopy } from 'react-icons/fi';

interface PaperSheetProps {
  onGenerateStory: (story: string) => void;
}

interface StoryInfo {
  id: string;
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
  const [titleStatus, setTitleStatus] = useState<'idle' | 'thinking' | 'erasing' | 'typing' | 'done'>('idle');
  const [titleText, setTitleText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

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

        // Анимация "Придумываю название..."
        setTitleStatus('thinking');
        const thinkingText = "Придумываю название...";
        for (let i = 0; i <= thinkingText.length; i++) {
          setTitleText(thinkingText.slice(0, i));
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Генерация заголовка
        const titleResponse = await fetch('/api/generateTitle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ story: generatedStory }),
        });

        if (titleResponse.ok) {
          const { title } = await titleResponse.json();
          
          // Анимация стирания "Придумываю название..."
          setTitleStatus('erasing');
          for (let i = thinkingText.length; i >= 0; i--) {
            setTitleText(thinkingText.slice(0, i));
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // Анимация вывода названия
          setTitleStatus('typing');
          for (let i = 0; i <= title.length; i++) {
            setTitleText(title.slice(0, i));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          setTitleStatus('done');

          const saveResponse = await fetch('/api/saveStory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: title,
              content: generatedStory,
              prompt,
              model,
            }),
          });

          if (saveResponse.ok) {
            const savedStory = await saveResponse.json();
            setStoryInfo({
              id: savedStory.id,
              number: savedStory.number,
              createdAt: new Date(savedStory.createdAt).toLocaleString(),
              model: savedStory.model,
            });
          } else {
            throw new Error('Failed to save story');
          }
        } else {
          throw new Error('Failed to generate title');
        }
      } catch (error) {
        console.error(error);
        setTitleStatus('idle');
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
    setTitleText('');
    setTitleStatus('idle');
  };

  const Cursor = () => (
    <motion.span
      className="inline-block bg-blue-500"
      style={{ width: '0.6em', height: '1em', marginLeft: '2px' }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  );

  const handleCopyLink = () => {
    if (storyInfo) {
      const url = `${window.location.origin}/story/${storyInfo.id}`;
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {storyInfo && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleNewStory}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-jetbrains-mono text-sm flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Новая история
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-gray-100 rounded-lg shadow-md flex justify-between items-center font-jetbrains-mono"
          >
            <span className="text-sm">Поделиться историей:</span>
            <div className="flex items-center">
              <input
                type="text"
                value={`${window.location.origin}/story/${storyInfo.id}`}
                readOnly
                className="mr-2 px-2 py-1 border rounded text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center"
              >
                <FiCopy className="mr-2" />
                {isCopied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
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
        {titleStatus !== 'idle' && (
          <div className={`mb-4 text-center ${titleStatus === 'thinking' || titleStatus === 'erasing' ? 'font-jetbrains-mono text-xs' : 'font-neucha text-2xl font-bold'}`}>
            {titleText}
            {(titleStatus === 'thinking' || titleStatus === 'erasing' || titleStatus === 'typing') && <Cursor />}
          </div>
        )}
        {titleStatus === 'idle' && !isGenerating && !isErasing && !storyInfo && (
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full border-none resize-none focus:outline-none bg-transparent font-neucha"
            style={{
              padding: '8px 10px',
              fontSize: '18px',
              lineHeight: '1.6',
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
              fontSize: '18px',
              lineHeight: '1.6',
              overflowWrap: 'break-word',
              overflowY: 'auto',
            }}
          >
            {displayContent}
            {(isGenerating || isErasing) && <Cursor />}
          </div>
        )}
      </motion.div>
      {storyInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gray-100 rounded-lg shadow-md text-xs text-gray-600 flex justify-between items-center font-jetbrains-mono"
        >
          <span className="font-semibold">#{storyInfo.number}</span>
          <span>{storyInfo.createdAt}</span>
          <span className="text-blue-600">{storyInfo.model}</span>
        </motion.div>
      )}
    </div>
  );
};

export default PaperSheet;
