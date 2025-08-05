"use client";

import React, { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';

interface FusionCounterProps {
  onCountUpdate?: (count: number) => void;
}

export interface FusionCounterRef {
  incrementCount: () => void;
}

const FusionCounter = forwardRef<FusionCounterRef, FusionCounterProps>(({ onCountUpdate }, ref) => {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    try {
      const response = await fetch('/api/fusion-count');
      if (!response.ok) {
        throw new Error('Failed to fetch count');
      }
      const data = await response.json();
      setCount(data.count);
      onCountUpdate?.(data.count);
    } catch (err) {
      console.error('Error fetching fusion count:', err);
      setError('Failed to load count');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const incrementCount = useCallback(async () => {
    try {
      const response = await fetch('/api/fusion-count', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to increment count');
      }
      const data = await response.json();
      setCount(data.count);
      onCountUpdate?.(data.count);
    } catch (err) {
      console.error('Error incrementing fusion count:', err);
    }
  }, [onCountUpdate]);

  // Expose incrementCount method to parent
  useImperativeHandle(ref, () => ({
    incrementCount,
  }), [incrementCount]);

  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
            <span className="text-xs text-gray-400">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2">
          <span className="text-xs text-gray-500">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2 hover:bg-gray-900/90 transition-all duration-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm">🎨</span>
          <span className="text-sm text-gray-300">
            <span className="font-semibold text-white tabular-nums">{count.toLocaleString()}</span>
            {' '}fusion{count !== 1 ? 's' : ''} created so far!
          </span>
        </div>
      </div>
    </div>
  );
});

FusionCounter.displayName = 'FusionCounter';

export default FusionCounter;