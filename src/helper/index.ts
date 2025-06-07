export const generateSecureOTP = (length = 4): string => {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);  
  return Array.from(randomBytes, (byte) => String(byte % 10)).join('');
};
