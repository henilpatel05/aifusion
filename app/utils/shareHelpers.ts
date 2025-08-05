/**
 * Helper functions for sharing functionality
 */

export interface ShareData {
  title: string;
  text: string;
  image?: File | Blob;
  files?: File[];
  url?: string;
}

export interface SocialPlatformText {
  twitter: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  generic: string;
}

/**
 * Convert base64 image data to File object
 */
export const base64ToFile = (base64Data: string, filename: string = 'ai-fusion.png'): File => {
  // Remove data URL prefix if present
  const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Convert base64 to binary
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new File([bytes], filename, { type: 'image/png' });
};

/**
 * Convert base64 image data to Blob
 */
export const base64ToBlob = (base64Data: string): Blob => {
  const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: 'image/png' });
};

/**
 * Generate platform-specific sharing text
 */
export const generateSocialText = (
  input1: string,
  input2: string,
  description?: string,
  lore?: string
): SocialPlatformText => {
  const baseText = `I fused a ${input1} and a ${input2} using AI! 🤖✨`;
  
  return {
    twitter: `${baseText}\n\n${description ? `"${description}"` : ''}\n\n#AIFusion #AI #Creative`,
    
    instagram: `${baseText}\n\n${description ? `${description}` : ''}\n${lore ? `\n✨ ${lore}` : ''}\n\n#AIFusion #AIArt #Creative #FusionArt`,
    
    facebook: `${baseText}\n\n${description ? `Description: "${description}"` : ''}${lore ? `\n\nLore: "${lore}"` : ''}\n\nCreate your own AI fusion at AI Fusion!`,
    
    linkedin: `Just created an amazing AI fusion combining ${input1} and ${input2}!\n\n${description ? `The result: "${description}"` : ''}\n\nAI continues to amaze with its creative possibilities. #AI #Innovation #Creativity`,
    
    generic: `I fused a ${input1} and a ${input2} and got this!\n\n${description ? `Description: "${description}"\n\n` : ''}${lore ? `Lore: "${lore}"\n\n` : ''}Create your own at AI Fusion!`
  };
};

/**
 * Download file to device
 */
export const downloadFile = (file: File | Blob, filename: string): void => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Copy image to clipboard (for supported browsers)
 */
export const copyImageToClipboard = async (imageData: string): Promise<boolean> => {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      return false;
    }
    
    const blob = base64ToBlob(imageData);
    const clipboardItem = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([clipboardItem]);
    return true;
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    return false;
  }
};

/**
 * Share using Web Share API
 */
export const shareNatively = async (shareData: ShareData): Promise<boolean> => {
  try {
    if (!navigator.share) {
      return false;
    }
    
    const sharePayload: ShareData = {
      title: shareData.title,
      text: shareData.text
    };
    
    // Add image if supported
    if (shareData.image && navigator.canShare) {
      const canShareWithFile = navigator.canShare({ files: [shareData.image as File] });
      if (canShareWithFile) {
        sharePayload.files = [shareData.image as File];
      }
    }
    
    // Add URL if provided
    if (shareData.url) {
      sharePayload.url = shareData.url;
    }
    
    await navigator.share(sharePayload);
    return true;
  } catch (error) {
    // User cancelled or sharing failed
    if (error instanceof Error && error.name === 'AbortError') {
      return false; // User cancelled, not an error
    }
    console.error('Native sharing failed:', error);
    return false;
  }
};

/**
 * Generate filename based on fusion inputs
 */
export const generateFileName = (input1: string, input2: string): string => {
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const timestamp = new Date().toISOString().slice(0, 10);
  return `ai-fusion-${sanitize(input1)}-${sanitize(input2)}-${timestamp}.png`;
};