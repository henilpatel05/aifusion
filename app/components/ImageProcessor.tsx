'use client';

import React from 'react';
import { base64ToFile, base64ToBlob, downloadFile, copyImageToClipboard, generateFileName } from '../utils/shareHelpers';

interface ImageProcessorProps {
  imageData: string;
  input1: string;
  input2: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const ImageProcessor: React.FC<ImageProcessorProps> = ({
  imageData,
  input1,
  input2,
  onSuccess,
  onError
}) => {
  const handleDownload = () => {
    try {
      const file = base64ToFile(imageData, generateFileName(input1, input2));
      downloadFile(file, file.name);
      onSuccess?.('Image downloaded successfully!');
    } catch (error) {
      onError?.('Failed to download image');
      console.error('Download error:', error);
    }
  };

  const handleCopyImage = async () => {
    try {
      const success = await copyImageToClipboard(imageData);
      if (success) {
        onSuccess?.('Image copied to clipboard!');
      } else {
        onError?.('Clipboard not supported on this device');
      }
    } catch (error) {
      onError?.('Failed to copy image to clipboard');
      console.error('Copy image error:', error);
    }
  };

  const getImageFile = (): File => {
    return base64ToFile(imageData, generateFileName(input1, input2));
  };

  const getImageBlob = (): Blob => {
    return base64ToBlob(imageData);
  };

  const getImageSize = (): number => {
    try {
      const base64 = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      return Math.ceil(base64.length * 0.75); // Approximate size in bytes
    } catch {
      return 0;
    }
  };


  return (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <button
          onClick={handleDownload}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download</span>
        </button>
        
        <button
          onClick={handleCopyImage}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Copy Image</span>
        </button>
      </div>
      
      <div className="text-xs text-gray-400 text-center">
        Image size: {Math.round(getImageSize() / 1024)}KB
      </div>
    </div>
  );
};

export default ImageProcessor;