"use client";

import React from 'react';

interface FusionExample {
  item1: string;
  item2: string;
  emoji1: string;
  emoji2: string;
  color: string;
  description: string;
}

interface FusionExamplesProps {
  onExampleClick: (item1: string, item2: string) => void;
}

const FusionExamples: React.FC<FusionExamplesProps> = ({ onExampleClick }) => {
  const examples: FusionExample[] = [
    {
      item1: "Dragon",
      item2: "Coffee",
      emoji1: "🐉",
      emoji2: "☕",
      color: "border-purple-400/30 hover:border-purple-400/70",
      description: "Mythical meets morning ritual"
    },
    {
      item1: "Robot",
      item2: "Garden",
      emoji1: "🤖",
      emoji2: "🌻",
      color: "border-cyan-400/30 hover:border-cyan-400/70",
      description: "Technology meets nature"
    },
    {
      item1: "Piano",
      item2: "Ocean",
      emoji1: "🎹",
      emoji2: "🌊",
      color: "border-blue-400/30 hover:border-blue-400/70",
      description: "Music meets the sea"
    },
    {
      item1: "Castle",
      item2: "Spaceship",
      emoji1: "🏰",
      emoji2: "🚀",
      color: "border-pink-400/30 hover:border-pink-400/70",
      description: "Medieval meets futuristic"
    },
    {
      item1: "Cat",
      item2: "Taco",
      emoji1: "🐱",
      emoji2: "🌮",
      color: "border-orange-400/30 hover:border-orange-400/70",
      description: "Adorable meets delicious"
    },
    {
      item1: "Lightning",
      item2: "Flower",
      emoji1: "⚡",
      emoji2: "🌸",
      color: "border-yellow-400/30 hover:border-yellow-400/70",
      description: "Power meets delicate beauty"
    }
  ];

  return (
    <div className="mb-4">
      <p className="text-center text-sm text-gray-400 mb-3">
        ✨ Get inspired by these fusion ideas ✨
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
        {/* Show first 3 examples on mobile, all 6 on larger screens */}
        {examples.map((example, index) => (
          <div
            key={index}
            onClick={() => onExampleClick(example.item1, example.item2)}
            className={`
              group cursor-pointer
              bg-gray-800/60 backdrop-blur-sm
              border ${example.color}
              rounded-full px-3 py-2
              transition-all duration-200 ease-out
              hover:scale-105 hover:bg-gray-700/70
              transform-gpu
              glass-card-mini
              flex items-center space-x-2
              relative overflow-hidden
              ${index >= 3 ? 'hidden sm:flex' : 'flex'}
            `}
            style={{
              backdropFilter: 'blur(8px)',
              background: 'rgba(31, 41, 55, 0.4)',
            }}
          >
            {/* Hover pattern effect with background blur */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none rounded-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-gray-900/30"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                  backgroundSize: '6px 6px',
                  filter: 'blur(0.5px)'
                }}
              ></div>
            </div>

            {/* Content */}
            <span className="text-sm transform transition-transform group-hover:scale-110 relative z-10">
              {example.emoji1}
            </span>
            <span className="text-xs font-bold text-white relative z-10">
              {example.item1}
            </span>
            <span className="text-xs font-bold text-purple-400 relative z-10">+</span>
            <span className="text-xs font-bold text-white relative z-10">
              {example.item2}
            </span>
            <span className="text-sm transform transition-transform group-hover:scale-110 relative z-10">
              {example.emoji2}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FusionExamples;