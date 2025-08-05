'use client';

import React, { useState } from 'react';
import { generateSocialText, copyToClipboard, base64ToFile, downloadFile, generateFileName, copyImageToClipboard } from '../utils/shareHelpers';
import ImageProcessor from './ImageProcessor';

interface DesktopShareOptionsProps {
  imageData: string;
  input1: string;
  input2: string;
  description?: string;
  lore?: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export const DesktopShareOptions: React.FC<DesktopShareOptionsProps> = ({
  imageData,
  input1,
  input2,
  description,
  lore,
  onSuccess,
  onError,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [selectedPlatform, setSelectedPlatform] = useState<'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'generic'>('generic');
  const socialText = generateSocialText(input1, input2, description, lore);

  const handleCopyText = async (platform: keyof typeof socialText) => {
    const text = socialText[platform];
    const success = await copyToClipboard(text);
    
    if (success) {
      onSuccess?.(`${platform.charAt(0).toUpperCase() + platform.slice(1)} text copied!`);
    } else {
      onError?.('Failed to copy text');
    }
  };

  const platformOptions = [
    { id: 'generic', name: 'General', icon: '🔗', color: 'bg-gray-500' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-500' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: '👥', color: 'bg-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' }
  ] as const;

  const tabs = [
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'text', name: 'Text', icon: '📝' }
  ] as const;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Share Your Fusion
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {input1} + {input2}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {activeTab === 'image' && (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="aspect-square max-w-xs mx-auto rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                <img 
                  src={imageData} 
                  alt="Fusion preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Image Actions */}
            <ImageProcessor
              imageData={imageData}
              input1={input1}
              input2={input2}
              onSuccess={onSuccess}
              onError={onError}
            />
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Platform
              </label>
              <div className="grid grid-cols-5 gap-2">
                {platformOptions.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedPlatform === platform.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{platform.icon}</div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {platform.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview Text
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans">
                  {socialText[selectedPlatform]}
                </pre>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={() => handleCopyText(selectedPlatform)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Copy {platformOptions.find(p => p.id === selectedPlatform)?.name} Text</span>
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-xl">💡</div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Sharing Tips
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Download the image and upload it manually to social media</li>
              <li>• Copy the text and paste it as your caption</li>
              <li>• Different platforms have optimized text formats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopShareOptions;