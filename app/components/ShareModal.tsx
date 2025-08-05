'use client';

import React, { useState, useEffect } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';
import MobileShareOptions from './MobileShareOptions';
import DesktopShareOptions from './DesktopShareOptions';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string;
  input1: string;
  input2: string;
  description?: string;
  lore?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageData,
  input1,
  input2,
  description,
  lore
}) => {
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update device info on mount and window resize
  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo());
    };

    window.addEventListener('resize', updateDeviceInfo);
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  // Handle success messages
  const handleSuccess = (text: string) => {
    setMessage({ type: 'success', text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle error messages
  const handleError = (text: string) => {
    setMessage({ type: 'error', text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isMobileView = deviceInfo.isMobile || deviceInfo.isTablet;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        {/* Success/Error Messages */}
        {message && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-60 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              <span>
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className={`
          w-full max-w-lg mx-auto transform transition-all duration-300 ease-out
          ${isMobileView 
            ? 'animate-slide-up' 
            : 'animate-fade-in scale-100'
          }
        `}>
          {isMobileView ? (
            <MobileShareOptions
              imageData={imageData}
              input1={input1}
              input2={input2}
              description={description}
              lore={lore}
              onSuccess={handleSuccess}
              onError={handleError}
              onClose={onClose}
            />
          ) : (
            <DesktopShareOptions
              imageData={imageData}
              input1={input1}
              input2={input2}
              description={description}
              lore={lore}
              onSuccess={handleSuccess}
              onError={handleError}
              onClose={onClose}
            />
          )}
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ShareModal;