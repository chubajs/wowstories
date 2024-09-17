"use client";

import React from 'react';

interface Story {
  id: string;
  title: string;
  content: string;
  number: number;
  createdAt: string;
  model: string;
}

interface StoryContentProps {
  story: Story;
}

const StoryContent: React.FC<StoryContentProps> = ({ story }) => {
  return (
    <div>
      <h1>{story.title}</h1>
      <p>{story.content}</p>
      {/* Add more story details as needed */}
    </div>
  );
};

export default StoryContent;