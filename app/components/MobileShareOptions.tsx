'use client';

import React, { useState } from 'react';
import { shareNatively, generateSocialText, base64ToFile, generateFileName } from '../utils/shareHelpers';
import { getShareCapabilities } from '../utils/deviceDetection';

interface MobileShareOptionsProps {
  imageData: string;
  input1: string;
  input2: string;
  description?: string;
  lore?: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export const MobileShareOptions: React.FC<MobileShareOptionsProps> = ({
  imageData,
  input1,
  input2,
  description,
  lore,
  onSuccess,
  onError,
  onClose
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const shareCapabilities = getShareCapabilities();
  const socialText = generateSocialText(input1, input2, description, lore);

  const handleNativeShare = async (platform: keyof typeof socialText = 'generic') => {
    setIsSharing(true);
    
    try {
      const imageFile = base64ToFile(imageData, generateFileName(input1, input2));
      const text = socialText[platform];
      
      const shareData = {
        title: 'My AI Fusion Creation',
        text,
        image: shareCapabilities.canShareFiles ? imageFile : undefined
      };
      
      const success = await shareNatively(shareData);
      
      if (success) {
        onSuccess?.('Shared successfully!');
        onClose?.();
      } else {
        // Fallback: try without image
        if (shareCapabilities.canShare) {
          const fallbackSuccess = await shareNatively({
            title: shareData.title,
            text: shareData.text
          });
          
          if (fallbackSuccess) {
            onSuccess?.('Shared text successfully! (Image sharing not supported)');
            onClose?.();
          } else {
            onError?.('Sharing was cancelled or failed');
          }
        } else {
          onError?.('Sharing not supported on this device');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      onError?.('Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const shareOptions = [
    {
      id: 'quick',
      label: 'Quick Share',
      icon: '🚀',
      description: 'Share to any app',
      platform: 'generic' as const,
      primary: true
    },
    {
      id: 'social',
      label: 'Social Media',
      icon: '📱',
      description: 'Instagram, Facebook, Twitter',
      platform: 'instagram' as const,
      primary: false
    },
    {
      id: 'professional',
      label: 'Professional',
      icon: '💼',
      description: 'LinkedIn-style sharing',
      platform: 'linkedin' as const,
      primary: false
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Share Your Fusion
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
            <img 
              src={imageData} 
              alt="Fusion preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {input1} + {input2}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI Fusion Creation
            </p>
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 italic">
            &quot;{description}&quot;
          </p>
        )}
      </div>

      {/* Share Options */}
      <div className="space-y-3">
        {shareOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleNativeShare(option.platform)}
            disabled={isSharing}
            className={`w-full p-4 rounded-xl text-left transition-all duration-200 disabled:opacity-50 ${
              option.primary
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{option.icon}</div>
              <div className="flex-1">
                <div className="font-semibold">{option.label}</div>
                <div className={`text-sm ${
                  option.primary ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {option.description}
                </div>
              </div>
              {isSharing && (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Capabilities Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        {shareCapabilities.canShareFiles ? (
          <p>✅ Image sharing supported</p>
        ) : (
          <p>ℹ️ Text-only sharing available</p>
        )}
        {shareCapabilities.maxFileSize > 0 && (
          <p>Max file size: {Math.round(shareCapabilities.maxFileSize / (1024 * 1024))}MB</p>
        )}
      </div>
    </div>
  );
};

export default MobileShareOptions;