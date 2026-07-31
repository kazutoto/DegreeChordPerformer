export const getAltKeyName = () => {
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    return /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent) ? 'Option' : 'Alt';
  }
  return 'Alt';
};
