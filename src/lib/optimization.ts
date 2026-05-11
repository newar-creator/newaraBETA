export const isLegacySchoolTV = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  
  // Detectar MS848 (chipset común en TVs escolares) y Chrome 69
  const isMS848 = ua.includes('MS848');
  const isChrome69 = ua.includes('Chrome/69');
  const isAndroid8 = ua.includes('Android 8');
  
  return isMS848 || (isChrome69 && isAndroid8);
};

export const getOptimizationFlags = () => {
  const legacy = isLegacySchoolTV();
  
  return {
    disableBlur: legacy,
    reduceAnimations: legacy,
    simplifyShadows: legacy,
    isLegacy: legacy
  };
};
