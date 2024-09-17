"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function StoryContent() {
  const { id } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      const response = await fetch(`/api/getStory/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStory(data);
      }
      setIsLoading(false);
    };
    fetchStory();
  }, [id]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/story/${story?.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-start py-8 px-4">
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-white z-50"
          >
            <Image
              src="/img/istorii.png"
              alt="Офигенные истории - логотип"
              width={150}
              height={50}
            />
          </motion.div>
        ) : (
          story && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-gray-100 rounded-lg shadow-md flex justify-between items-center font-jetbrains-mono"
              >
                <span className="text-sm">Поделиться историей:</span>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={`${window.location.origin}/story/${story.id}`}
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
                className="bg-white p-6 rounded-lg shadow-md font-neucha"
              >
                <h1 className="text-2xl font-bold mb-4 text-center">{story.title}</h1>
                <div className="whitespace-pre-wrap break-words">{story.content}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-gray-100 rounded-lg shadow-md text-xs text-gray-600 flex justify-between items-center font-jetbrains-mono"
              >
                <span className="font-semibold">#{story.number}</span>
                <span>{new Date(story.createdAt).toLocaleString()}</span>
                <span className="text-blue-600">{story.model}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex justify-center"
              >
                <Link href="/"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-jetbrains-mono text-sm flex items-center"
                >
                  <FiRefreshCw className="mr-2" />
                  Создать новую историю
                </Link>
              </motion.div>

              <Footer />

              <Link href="/" className="mt-8 flex justify-center">
                <Image
                  src="/img/istorii.png"
                  alt="Офигенные истории - логотип"
                  width={150}
                  height={50}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                />
              </Link>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}