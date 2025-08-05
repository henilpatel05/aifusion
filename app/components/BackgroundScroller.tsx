"use client";

import React from 'react';

interface BackgroundScrollerProps {
  userImages?: string[];
}

const BackgroundScroller: React.FC<BackgroundScrollerProps> = ({ userImages = [] }) => {
  // Static images from the ImageWall directory
  const staticImages = [
    '/ImageWall/ai-fusion-a-banana-a-cat-2025-08-05.png',
    '/ImageWall/ai-fusion-a-cat-croissant-2025-08-05.png',
    '/ImageWall/ai-fusion-ai-robot-grandma-2025-08-05.png',
    '/ImageWall/ai-fusion-cat-dinosaur-2025-08-05.png',
    '/ImageWall/ai-fusion-goat-fish-2025-08-05.png',
    '/ImageWall/ai-fusion-toilet-throne-2025-08-05.png',
  ];

  // Combine static images with user-generated images
  const allImages = [...userImages, ...staticImages];
  
  // Create multiple sets for infinite scrolling with more images
  // All sets now include user images by using the full allImages array
  const imageSet1 = [...allImages, ...allImages, ...allImages];
  const imageSet2 = [...allImages.slice(2), ...allImages.slice(0, 2), ...allImages, ...allImages];
  const imageSet3 = [...allImages.slice(1), ...allImages.slice(0, 1), ...allImages, ...allImages];
  const imageSet4 = [...allImages.slice(3), ...allImages.slice(0, 3), ...allImages, ...allImages];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {/* Column 1 - Left */}
      <div className="absolute left-0 top-0 w-1/2 md:w-1/4 h-[400vh] animate-scroll-up-slow opacity-8">
        <div className="flex flex-col space-y-6 md:space-y-8 px-2 md:px-4 py-8">
          {imageSet1.map((image, index) => (
            <img
              key={`col1-${index}`}
              src={image}
              alt=""
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-40 md:h-40 lg:w-48 lg:h-48 object-cover rounded-lg md:rounded-xl shadow-lg transform rotate-12 mx-auto"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* Column 2 - Right (mobile) / Left center (desktop) */}
      <div className="absolute right-0 md:left-1/4 top-0 w-1/2 md:w-1/4 h-[400vh] animate-scroll-down-medium opacity-6">
        <div className="flex flex-col space-y-8 md:space-y-10 px-2 md:px-4 py-16 md:py-20">
          {imageSet2.map((image, index) => (
            <img
              key={`col2-${index}`}
              src={image}
              alt=""
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-44 md:h-44 lg:w-56 lg:h-56 object-cover rounded-lg md:rounded-xl shadow-lg transform -rotate-8 mx-auto"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* Column 3 - Hidden on mobile, Right center on desktop */}
      <div className="hidden md:block absolute right-1/4 top-0 w-1/4 h-[400vh] animate-scroll-up-fast opacity-6">
        <div className="flex flex-col space-y-12 px-4 py-32">
          {imageSet3.map((image, index) => (
            <img
              key={`col3-${index}`}
              src={image}
              alt=""
              className="w-44 h-44 lg:w-52 lg:h-52 object-cover rounded-xl shadow-lg transform rotate-6 mx-auto"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* Column 4 - Hidden on mobile, Right on desktop */}
      <div className="hidden md:block absolute right-0 top-0 w-1/4 h-[400vh] animate-scroll-down-slow opacity-8">
        <div className="flex flex-col space-y-9 px-4 py-16">
          {imageSet4.map((image, index) => (
            <img
              key={`col4-${index}`}
              src={image}
              alt=""
              className="w-40 h-40 lg:w-48 lg:h-48 object-cover rounded-xl shadow-lg transform -rotate-10 mx-auto"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundScroller;