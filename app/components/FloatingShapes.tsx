"use client";

import React from 'react';

const FloatingShapes: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating Circle 1 */}
      <div 
        className="absolute top-20 left-10 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-float-1"
        style={{
          animation: 'float1 8s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Triangle 1 */}
      <div 
        className="absolute top-40 right-20 w-12 h-12 animate-float-2"
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
          animation: 'float2 6s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Square 1 */}
      <div 
        className="absolute bottom-32 left-16 w-8 h-8 rotate-45 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 animate-float-3"
        style={{
          animation: 'float3 10s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Circle 2 */}
      <div 
        className="absolute bottom-20 right-16 w-20 h-20 rounded-full bg-gradient-to-r from-teal-500/8 to-green-500/8 animate-float-4"
        style={{
          animation: 'float4 7s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Diamond */}
      <div 
        className="absolute top-1/2 left-8 w-10 h-10 rotate-45 bg-gradient-to-r from-orange-500/12 to-red-500/12 animate-float-5"
        style={{
          animation: 'float5 9s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Hexagon */}
      <div 
        className="absolute top-60 right-8 w-14 h-14 animate-float-6"
        style={{
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
          background: 'linear-gradient(60deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
          animation: 'float6 11s ease-in-out infinite'
        }}
      ></div>
    </div>
  );
};

export default FloatingShapes;