"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiCopy } from 'react-icons/fi';
import Footer from '../../components/Footer';

interface Story {
  id: string;
  title: string;
  content: string;
  number: number;
  createdAt: string;
  model: string;
}

export default function StoryPage() {
  const { id } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      const response = await fetch(`/api/getStory/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStory(data);
      }
    };
    fetchStory();
  }, [id]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/story/${story?.number}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!story) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mb-4 p-3 bg-gray-100 rounded-lg shadow-md flex justify-between items-center font-jetbrains-mono"
      >
        <span className="text-sm">Поделиться историей:</span>
        <div className="flex items-center">
          <input
            type="text"
            value={`${window.location.origin}/story/${story.number}`}
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

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md font-neucha"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">{story.title}</h1>
        <div className="whitespace-pre-wrap break-words">{story.content}</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mt-4 p-3 bg-gray-100 rounded-lg shadow-md text-xs text-gray-600 flex justify-between items-center font-jetbrains-mono"
      >
        <span className="font-semibold">#{story.number}</span>
        <span>{new Date(story.createdAt).toLocaleString()}</span>
        <span className="text-blue-600">{story.model}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mt-4 flex justify-center"
      >
        <a
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-jetbrains-mono text-sm flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Создать новую историю
        </a>
      </motion.div>

      <Footer />
    </div>
  );
}