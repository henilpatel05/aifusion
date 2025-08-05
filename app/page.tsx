"use client";

import React, { useState, useEffect } from 'react';

// --- Helper Functions & Interfaces ---

// Define the structure for a suggestion
interface Suggestion {
    item1: string;
    item2: string;
}

// Function to create a simple SVG placeholder image
const createPlaceholderSvg = (text: string) => {
    const bgColor = '#374151'; // gray-700
    const textColor = '#d1d5db'; // gray-300
    const accentColor = '#8b5cf6'; // purple-500
    const encodedBg = encodeURIComponent(bgColor);
    const encodedText = encodeURIComponent(text);
    const encodedAccent = encodeURIComponent(accentColor);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='${encodedBg}'/%3E%3Ctext x='200' y='190' text-anchor='middle' fill='${encodedText}' font-size='24' font-family='Arial, sans-serif' font-weight='bold'%3EFusion of%3C/text%3E%3Ctext x='200' y='230' text-anchor='middle' fill='${encodedAccent}' font-size='28' font-family='Arial, sans-serif' font-weight='bold'%3E${encodedText}%3C/text%3E%3C/svg%3E`;
};


// --- Background Scroller Component ---

interface BackgroundScrollerProps {
    images: string[];
}

const BackgroundScroller: React.FC<BackgroundScrollerProps> = ({ images }) => {
    // We need to duplicate the images to create a seamless loop
    const extendedImages = [...images, ...images];

    // Split images into two columns for the parallax effect
    const column1Images = extendedImages.filter((_, i) => i % 2 === 0);
    const column2Images = extendedImages.filter((_, i) => i % 2 !== 0);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10"></div>
            <div className="absolute flex h-full space-x-4">
                <div className="flex flex-col h-full animate-scroll-up space-y-4">
                    {column1Images.map((src, index) => (
                        <img key={`col1-${index}`} src={src} alt="Fused background image" className="h-64 w-64 object-cover rounded-2xl shadow-lg opacity-20" />
                    ))}
                </div>
                <div className="flex flex-col h-full animate-scroll-down space-y-4">
                     {column2Images.map((src, index) => (
                        <img key={`col2-${index}`} src={src} alt="Fused background image" className="h-64 w-64 object-cover rounded-2xl shadow-lg opacity-20" />
                    ))}
                </div>
            </div>
        </div>
    );
};


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
    const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [lore, setLore] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<string>('');
    
    // State for the background image wall
    const [fusedImages, setFusedImages] = useState<string[]>([]);

    // Populate the background with some initial images on component mount
    useEffect(() => {
        setFusedImages([
            createPlaceholderSvg("Galaxy & Hourglass"),
            createPlaceholderSvg("Robot & Forest"),
            createPlaceholderSvg("Whale & Skyscraper"),
            createPlaceholderSvg("Book & Volcano"),
            createPlaceholderSvg("Piano & Waterfall"),
            createPlaceholderSvg("Compass & Feather"),
            createPlaceholderSvg("Lighthouse & Guitar"),
            createPlaceholderSvg("Spaceship & Sunflower"),
        ]);
    }, []);

    // --- Gemini API Integration ---

    // Access the API key from environment variables safely on the client
    const apiKey = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : "") || "";

    const fetchWithExponentialBackoff = async (url: string, payload: object, maxRetries: number = 5): Promise<any> => {
        let attempt = 0;
        let delay = 1000;
        while (attempt < maxRetries) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (response.ok) return await response.json();
                if (response.status === 429 || response.status >= 500) {
                    console.warn(`API call failed with status ${response.status}. Retrying in ${delay / 1000}s...`);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                if (attempt >= maxRetries - 1) throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            attempt++;
        }
        throw new Error('API request failed after multiple retries.');
    };

    const handleGenerateImage = async () => {
        if (!apiKey) {
            setError("API Key is not configured. Please set it up in your environment variables.");
            return;
        }
        if (!input1.trim() || !input2.trim()) {
            setError("Please fill out both fields to create a fusion!");
            return;
        }

        setIsLoadingImage(true);
        setError(null);
        setResultImageUrl(null);
        setGeneratedPrompt(null);
        setDescription(null);
        setLore(null);
        setCopySuccess('');

        const prompt = `A high-quality, vibrant, and clear image of a fusion between a "${input1}" and a "${input2}"${theme ? `, with a ${theme} theme` : ''}. The final image should be a creative and seamless blend of the two concepts.`;
        setGeneratedPrompt(prompt);

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
            const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
            const result = await fetchWithExponentialBackoff(apiUrl, payload);

            if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                setResultImageUrl(imageUrl);
                // Add the new image to the beginning of the background wall
                setFusedImages(prevImages => [imageUrl, ...prevImages]);
            } else {
                throw new Error("Image generation failed: No image data received.");
            }
        } catch (err: any) {
            console.error("Image Generation Error:", err);
            setError(`Failed to create image. ${err.message}`);
        } finally {
            setIsLoadingImage(false);
        }
    };

    const handleSuggestIdeas = async () => {
        if (!apiKey) {
            setError("API Key is not configured.");
            return;
        }
        setIsLoadingText(true);
        setError(null);
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const prompt = "Generate two creative and contrasting items that could be fused together. Provide the response as a JSON object with keys 'item1' and 'item2'.";
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: { type: "OBJECT", properties: { "item1": { "type": "STRING" }, "item2": { "type": "STRING" } }, required: ["item1", "item2"] }
                }
            };
            const result = await fetchWithExponentialBackoff(apiUrl, payload);
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                const suggestion: Suggestion = JSON.parse(text);
                setInput1(suggestion.item1);
                setInput2(suggestion.item2);
            } else {
                throw new Error("Could not parse suggestion from API response.");
            }
        } catch (err: any) {
            console.error("Suggestion Error:", err);
            setError("Failed to get suggestions. Please try again.");
        } finally {
            setIsLoadingText(false);
        }
    };

    const handleDescribeCreation = async () => {
        if (!apiKey) {
            setError("API Key is not configured.");
            return;
        }
        if (!input1 || !input2) return;
        setIsLoadingText(true);
        setError(null);
        setDescription(null);
        setCopySuccess('');
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const prompt = `Write a short, creative, and engaging description for a fantastical object that is a fusion of a "${input1}" and a "${input2}".`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const result = await fetchWithExponentialBackoff(apiUrl, payload);
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                setDescription(text.trim());
            } else {
                throw new Error("Could not generate a description.");
            }
        } catch (err: any) {
            console.error("Description Error:", err);
            setError("Failed to generate a description.");
        } finally {
            setIsLoadingText(false);
        }
    };

    const handleGenerateLore = async () => {
        if (!apiKey) {
            setError("API Key is not configured.");
            return;
        }
        if (!description) return;
        setIsLoadingText(true);
        setError(null);
        setLore(null);
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const prompt = `Based on this description: "${description}", write a short, mythical-sounding lore or backstory for this creation. Make it sound like a legend.`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const result = await fetchWithExponentialBackoff(apiUrl, payload);
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                setLore(text.trim());
            } else {
                throw new Error("Could not generate lore.");
            }
        } catch (err: any) {
            console.error("Lore Generation Error:", err);
            setError("Failed to generate lore.");
        } finally {
            setIsLoadingText(false);
        }
    };

    const handleCopy = (textToCopy: string, type: 'Description' | 'Shareable') => {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopySuccess(`${type} copied to clipboard!`);
        } catch (err) {
            setCopySuccess(`Failed to copy ${type}.`);
        }
        document.body.removeChild(textArea);
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const handleShare = async () => {
        let shareText = `I fused a ${input1} and a ${input2} and got this!\n\n`;
        if (description) shareText += `Description: "${description}"\n\n`;
        if (lore) shareText += `Lore: "${lore}"\n\n`;
        shareText += `Create your own at AI Fusion!`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'My AI Fusion Creation', text: shareText });
            } catch (error: any) {
                if (error.name !== 'AbortError') handleCopy(shareText, 'Shareable');
            }
        } else {
            handleCopy(shareText, 'Shareable');
        }
    };

    const isLoading = isLoadingImage || isLoadingText;

    const resetToInputs = () => {
        setInput1('');
        setInput2('');
        setTheme('');
        setResultImageUrl(null);
        setGeneratedPrompt(null);
        setDescription(null);
        setLore(null);
        setError(null);
        setCopySuccess('');
    };

    // --- JSX Rendering ---
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
            <BackgroundScroller images={fusedImages} />
            <div className="w-full max-w-2xl mx-auto z-20 flex flex-col justify-center">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl md:text-7xl font-black mb-4" style={{
                        background: 'linear-gradient(to right, #ec4899, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        AI Fusion
                    </h1>
                    <p className="text-xl text-gray-300">Combine two things and see what the AI creates!</p>
                </div>

                {/* Main Content Container */}
                <div className="bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl min-h-[300px] flex flex-col justify-center border border-gray-700">
                    {/* --- Input View --- */}
                    {(!resultImageUrl || isLoadingImage) && (
                        <>
                            {/* Input Section */}
                            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                                <input type="text" value={input1} onChange={(e) => setInput1(e.target.value)} className="w-full sm:flex-1 bg-gray-700 border-2 border-gray-600 rounded-xl p-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" placeholder="Enter first item" disabled={isLoading} />
                                <div className="text-3xl font-bold text-purple-400">+</div>
                                <input type="text" value={input2} onChange={(e) => setInput2(e.target.value)} className="w-full sm:flex-1 bg-gray-700 border-2 border-gray-600 rounded-xl p-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" placeholder="Enter second item" disabled={isLoading} />
                            </div>
                            <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition mb-6" placeholder="Optional: Add a theme (e.g., fantasy, cyberpunk)" disabled={isLoading} />
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                <button onClick={handleSuggestIdeas} disabled={isLoading} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{isLoadingText && !isLoadingImage ? 'Suggesting...' : '✨ Surprise Me'}</button>
                                <button onClick={handleGenerateImage} disabled={isLoading} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{isLoadingImage ? 'Fusing...' : '🚀 Create Fusion'}</button>
                            </div>
                            {isLoadingImage && (
                                <div className="flex flex-col items-center justify-center pt-8">
                                    <div className="w-16 h-16 border-4 border-t-purple-500 border-gray-300 rounded-full animate-spin mb-6"></div>
                                    <p className="text-xl text-gray-400">Creating your fusion...</p>
                                    <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
                                </div>
                            )}
                        </>
                    )}
                    {error && !isLoading && (
                        <div className="bg-red-900/20 border-2 border-red-500/50 text-red-200 p-6 rounded-2xl text-center">
                            <h3 className="font-bold text-xl mb-2">Oops! An Error Occurred.</h3>
                            <p>{error}</p>
                            <button onClick={resetToInputs} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Try Again</button>
                        </div>
                    )}
                    {resultImageUrl && !isLoadingImage && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="relative"><img src={resultImageUrl} alt={`AI Generated Fusion of ${input1} and ${input2}`} className="rounded-2xl w-full h-auto mx-auto shadow-xl bg-gray-700" /><div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full"><span className="text-sm text-white font-medium">{input1} + {input2}</span></div></div>
                            <div className="flex space-x-3">{!description ? (<button onClick={handleDescribeCreation} disabled={isLoading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{isLoadingText ? 'Writing...' : '📝 Describe'}</button>) : !lore ? (<button onClick={handleGenerateLore} disabled={isLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{isLoadingText ? 'Creating...' : '📚 Add Lore'}</button>) : null}<button onClick={handleShare} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">🚀 Share</button></div>
                            {description && (<div className="bg-gray-700/50 p-6 rounded-2xl space-y-4"><div><h4 className="text-lg font-semibold text-purple-300 mb-2">Description</h4><p className="text-gray-300 italic">"{description}"</p></div>{lore && (<div className="border-t border-gray-600 pt-4"><h4 className="text-lg font-semibold text-pink-300 mb-2">Lore</h4><p className="text-gray-300 italic">"{lore}"</p></div>)}</div>)}
                            <div className="pt-4 border-t border-gray-600"><button onClick={resetToInputs} className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">✨ Create Another Fusion</button></div>
                            {copySuccess && (<div className="text-center"><p className="text-green-400 font-medium">{copySuccess}</p></div>)}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default AIFusionPage;
