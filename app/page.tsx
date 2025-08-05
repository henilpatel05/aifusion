"use client";

import React, { useState, useRef } from 'react';
import ShareModal from './components/ShareModal';
import BackgroundScroller from './components/BackgroundScroller';
import FusionExamples from './components/FusionExamples';
import FusionCounter, { FusionCounterRef } from './components/FusionCounter';

// --- Helper Functions & Interfaces ---

interface ApiErrorResponse {
  error: string;
}

interface GenerateImageResponse {
  success: boolean;
  imageData?: string;
  error?: string;
}

interface SuggestIdeasResponse {
  success: boolean;
  item1?: string;
  item2?: string;
  error?: string;
}

interface GenerateDescriptionResponse {
  success: boolean;
  description?: string;
  error?: string;
}

interface GenerateLoreResponse {
  success: boolean;
  lore?: string;
  error?: string;
}




// --- Main Page Component ---

const AIFusionPage: React.FC = () => {
  // State management for inputs, theme, loading states, errors, and results
  const [input1, setInput1] = useState<string>('');
  const [input2, setInput2] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [lore, setLore] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  // State for user-generated images to be added to background
  const [userGeneratedImages, setUserGeneratedImages] = useState<string[]>([]);
  
  // State for share modal
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  
  // Ref for fusion counter to trigger increments
  const fusionCounterRef = useRef<FusionCounterRef>(null);
  


  // --- API Integration ---


  const handleGenerateImage = async () => {
    if (!input1.trim() || !input2.trim()) {
      setError("Please fill out both fields to create a fusion!");
      return;
    }

    setIsLoadingImage(true);
    setError(null);
    setResultImageUrl(null);
    setDescription(null);
    setLore(null);
    setCopySuccess('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input1, input2, theme }),
      });

      const result = await response.json() as GenerateImageResponse | ApiErrorResponse;

      if (!response.ok) {
        throw new Error('error' in result ? result.error : 'Failed to generate image');
      }

      if ('success' in result && result.success && result.imageData) {
        const imageUrl = `data:image/png;base64,${result.imageData}`;
        setResultImageUrl(imageUrl);
        // Add the new image to the user-generated images for background
        setUserGeneratedImages(prevImages => [imageUrl, ...prevImages.slice(0, 9)]); // Keep only last 10 user images
        
        // Increment fusion counter
        fusionCounterRef.current?.incrementCount();
        
      } else {
        throw new Error("Image generation failed: No image data received.");
      }
    } catch (err: unknown) {
      console.error("Image Generation Error:", err);
      setError(`Failed to create image. ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleSuggestIdeas = async () => {
    setIsLoadingText(true);
    setError(null);
    setResultImageUrl(null); // Clear any previous results
    try {
      const response = await fetch('/api/suggest-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const result = await response.json() as SuggestIdeasResponse | ApiErrorResponse;

      if (!response.ok) {
        throw new Error('error' in result ? result.error : 'Failed to get suggestions');
      }

      if ('success' in result && result.success && result.item1 && result.item2) {
        setInput1(result.item1);
        setInput2(result.item2);
      } else {
        throw new Error("Could not parse suggestion from API response.");
      }
    } catch (err: unknown) {
      console.error("Suggestion Error:", err);
      setError(`Failed to get suggestions. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setIsLoadingText(false);
    }
  };

  const handleDescribeCreation = async () => {
    if (!input1 || !input2) return;
    setIsLoadingText(true);
    setError(null);
    setDescription(null);
    setCopySuccess('');
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input1, input2 }),
      });

      const result = await response.json() as GenerateDescriptionResponse | ApiErrorResponse;

      if (!response.ok) {
        throw new Error('error' in result ? result.error : 'Failed to generate description');
      }

      if ('success' in result && result.success && result.description) {
        setDescription(result.description);
      } else {
        throw new Error("Could not generate a description.");
      }
    } catch (err: unknown) {
      console.error("Description Error:", err);
      setError(`Failed to generate a description. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setIsLoadingText(false);
    }
  };

  const handleGenerateLore = async () => {
    if (!description) return;
    setIsLoadingText(true);
    setError(null);
    setLore(null);
    try {
      const response = await fetch('/api/generate-lore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      const result = await response.json() as GenerateLoreResponse | ApiErrorResponse;

      if (!response.ok) {
        throw new Error('error' in result ? result.error : 'Failed to generate lore');
      }

      if ('success' in result && result.success && result.lore) {
        setLore(result.lore);
      } else {
        throw new Error("Could not generate lore.");
      }
    } catch (err: unknown) {
      console.error("Lore Generation Error:", err);
      setError(`Failed to generate lore. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setIsLoadingText(false);
    }
  };


  const handleShare = () => {
    if (!resultImageUrl) return;
    setIsShareModalOpen(true);
  };

  const isLoading = isLoadingImage || isLoadingText;

  const resetToInputs = () => {
    setInput1('');
    setInput2('');
    setTheme('');
    setResultImageUrl(null);
    setDescription(null);
    setLore(null);
    setError(null);
    setCopySuccess('');
  };

  const handleExampleClick = (item1: string, item2: string) => {
    setInput1(item1);
    setInput2(item2);
    setError(null);
  };

  // --- JSX Rendering ---
  return (
    <>
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 pb-12 overflow-hidden">
      {/* Background Scroller */}
      <BackgroundScroller userImages={userGeneratedImages} />
      <div className="w-full max-w-2xl mx-auto z-20 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 animate-fade-in-up animate-title-breathe animate-title-glow hover:scale-105 transition-transform duration-300 cursor-default" 
            style={{
              background: 'linear-gradient(to right, #ec4899, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            ReeFusion
          </h1>
          <div className="space-y-2">
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 animate-slide-in-stagger-1 font-medium">
              Combine two things and see what the AI creates! 🚀
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 animate-slide-in-stagger-2">
              From cat-dog hybrids to your boss riding a unicorn 😂
            </p>
          </div>
        </div>

        {/* Fusion Examples - Only show in input state */}
        {!resultImageUrl && !isLoadingImage && (
          <FusionExamples onExampleClick={handleExampleClick} />
        )}

        {/* Main Content Container */}
        <div className="bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl min-h-[300px] flex flex-col justify-center border border-gray-700 space-y-6 hover:bg-gray-800/90 hover:border-gray-600 transition-all duration-300 hover:shadow-purple-500/10 hover:shadow-3xl animate-fade-in-up">
          
          {/* --- Input State --- */}
          {!resultImageUrl && !isLoadingImage && (
            <>
              {/* Input Section */}
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                <input type="text" value={input1} onChange={(e) => setInput1(e.target.value)} className="w-full sm:flex-1 bg-gray-700 border-2 border-gray-600 rounded-xl p-3 sm:p-4 text-base sm:text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-500 hover:bg-gray-600/50 focus:scale-[1.02]" placeholder="Enter first item" disabled={isLoading} />
                <div className="text-2xl sm:text-3xl font-bold text-purple-400 animate-pulse hover:scale-110 transition-transform duration-200">+</div>
                <input type="text" value={input2} onChange={(e) => setInput2(e.target.value)} className="w-full sm:flex-1 bg-gray-700 border-2 border-gray-600 rounded-xl p-3 sm:p-4 text-base sm:text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-500 hover:bg-gray-600/50 focus:scale-[1.02]" placeholder="Enter second item" disabled={isLoading} />
              </div>
              <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-3 sm:p-4 text-base sm:text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-gray-500 hover:bg-gray-600/50 focus:scale-[1.02] mb-6" placeholder="Optional: Add a theme (e.g., fantasy, cyberpunk)" disabled={isLoading} />
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button onClick={handleSuggestIdeas} disabled={isLoading} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{isLoadingText && !isLoadingImage ? 'Suggesting...' : '✨ Surprise Me'}</button>
                <button onClick={handleGenerateImage} disabled={isLoading} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{isLoadingImage ? 'Fusing...' : '🚀 Create Fusion'}</button>
              </div>
            </>
          )}

          {/* --- Loading State --- */}
          {isLoadingImage && (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              {/* Show context of what's being created */}
              <div className="mb-8 text-center">
                <p className="text-lg text-gray-300 mb-2">
                  Creating fusion of
                </p>
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <span className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full text-lg font-semibold">
                    {input1}
                  </span>
                  <span className="text-2xl text-purple-400">+</span>
                  <span className="bg-pink-600/20 text-pink-300 px-4 py-2 rounded-full text-lg font-semibold">
                    {input2}
                  </span>
                </div>
                {theme && (
                  <p className="text-sm text-teal-400">
                    with <span className="font-semibold">{theme}</span> theme
                  </p>
                )}
              </div>
              
              {/* Large loading animation */}
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-t-purple-500 border-r-pink-500 border-b-purple-400 border-l-pink-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-t-transparent border-r-transparent border-b-purple-300 border-l-purple-300 rounded-full animate-spin animate-reverse" style={{animationDuration: '3s'}}></div>
              </div>
              
              {/* Progress text */}
              <div className="text-center">
                <p className="text-xl text-gray-300 mb-2 font-medium">Creating your fusion...</p>
                <p className="text-sm text-gray-500">This might take a moment</p>
              </div>
            </div>
          )}
          {error && !isLoading && (
            <div className="bg-red-900/20 border-2 border-red-500/50 text-red-200 p-6 rounded-2xl text-center mx-4">
              <h3 className="font-bold text-xl mb-3">Oops! An Error Occurred.</h3>
              <p className="mb-4 text-red-300">{error}</p>
              <button onClick={resetToInputs} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">Try Again</button>
            </div>
          )}
          {resultImageUrl && !isLoadingImage && (
            <div className="space-y-6 animate-fade-in px-2">
              <div className="relative"><img src={resultImageUrl} alt={`AI Generated Fusion of ${input1} and ${input2}`} className="rounded-2xl w-full h-auto mx-auto shadow-xl bg-gray-700" /><div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full"><span className="text-sm text-white font-medium">{input1} + {input2}</span></div></div>
              <div className="flex space-x-3">{!description ? (<button onClick={handleDescribeCreation} disabled={isLoading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{isLoadingText ? 'Writing...' : '📝 Describe'}</button>) : !lore ? (<button onClick={handleGenerateLore} disabled={isLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{isLoadingText ? 'Creating...' : '📚 Add Lore'}</button>) : null}<button onClick={handleShare} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">🚀 Share</button></div>
              {description && (<div className="bg-gray-700/50 p-6 rounded-2xl space-y-4"><div><h4 className="text-lg font-semibold text-purple-300 mb-2">Description</h4><p className="text-gray-300 italic">&quot;{description}&quot;</p></div>{lore && (<div className="border-t border-gray-600 pt-4"><h4 className="text-lg font-semibold text-pink-300 mb-2">Lore</h4><p className="text-gray-300 italic">&quot;{lore}&quot;</p></div>)}</div>)}
              <div className="pt-4 border-t border-gray-600"><button onClick={resetToInputs} className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">✨ Create Another Fusion</button></div>
              {copySuccess && (<div className="text-center"><p className="text-green-400 font-medium">{copySuccess}</p></div>)}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageData={resultImageUrl || ''}
        input1={input1}
        input2={input2}
        description={description || undefined}
        lore={lore || undefined}
      />
    </main>
    
    {/* Sticky Fusion Counter Footer */}
    <FusionCounter ref={fusionCounterRef} />
    </>
  );
};

export default AIFusionPage;
