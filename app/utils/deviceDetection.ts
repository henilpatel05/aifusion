/**
 * Device detection and Web Share API utilities
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: string;
}

export interface ShareCapabilities {
  canShare: boolean;
  canShareFiles: boolean;
  maxFileSize: number; // in bytes
}

/**
 * Detect device type based on screen size and user agent
 */
export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  
  // Mobile detection
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(userAgent);
  const isMobileScreen = screenWidth <= 768;
  const isMobile = isMobileUA || isMobileScreen;
  
  // Tablet detection
  const tabletRegex = /iPad|Android.*tablet|Surface/i;
  const isTabletUA = tabletRegex.test(userAgent);
  const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;
  const isTablet = isTabletUA || (isTabletScreen && isMobileUA);
  
  // Desktop is everything else
  const isDesktop = !isMobile && !isTablet;
  
  // Platform detection
  let platform = 'unknown';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    platform = 'ios';
  } else if (userAgent.includes('Android')) {
    platform = 'android';
  } else if (userAgent.includes('Windows')) {
    platform = 'windows';
  } else if (userAgent.includes('Mac')) {
    platform = 'macos';
  } else if (userAgent.includes('Linux')) {
    platform = 'linux';
  }
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    platform
  };
};

/**
 * Check Web Share API capabilities
 */
export const getShareCapabilities = (): ShareCapabilities => {
  const hasNavigator = typeof navigator !== 'undefined';
  const canShare = hasNavigator && 'share' in navigator;
  
  // Check if browser supports sharing files
  let canShareFiles = false;
  let maxFileSize = 0;
  
  if (canShare && typeof navigator.share === 'function') {
    try {
      // Test with a small dummy file to check support
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [testFile] }));
      
      // Set reasonable file size limits based on platform
      const deviceInfo = getDeviceInfo();
      if (deviceInfo.platform === 'ios') {
        maxFileSize = 50 * 1024 * 1024; // 50MB for iOS
      } else if (deviceInfo.platform === 'android') {
        maxFileSize = 100 * 1024 * 1024; // 100MB for Android
      } else {
        maxFileSize = 10 * 1024 * 1024; // 10MB for others
      }
    } catch {
      canShareFiles = false;
    }
  }
  
  return {
    canShare,
    canShareFiles,
    maxFileSize
  };
};

/**
 * Check if device is likely to have social media apps installed
 */
export const hasSocialMediaApps = (): boolean => {
  const deviceInfo = getDeviceInfo();
  return deviceInfo.isMobile || deviceInfo.isTablet;
};

/**
 * Get appropriate sharing strategy based on device and capabilities
 */
export const getOptimalSharingStrategy = (): 'native' | 'download' | 'copy' => {
  const deviceInfo = getDeviceInfo();
  const shareCapabilities = getShareCapabilities();
  
  if (deviceInfo.isMobile && shareCapabilities.canShareFiles) {
    return 'native';
  } else if (deviceInfo.isDesktop) {
    return 'download';
  } else {
    return 'copy';
  }
};