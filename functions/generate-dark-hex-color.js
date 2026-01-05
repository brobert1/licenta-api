const generateDarkHexColor = () => {
  // Generate RGB values between 0-180 instead of 0-255 to avoid bright colors
  const r = Math.floor(Math.random() * 180);
  const g = Math.floor(Math.random() * 180);
  const b = Math.floor(Math.random() * 180);

  // Convert to hex and pad with zeros if needed
  const hex = ((r << 16) | (g << 8) | b)
    .toString(16)
    .padStart(6, '0');

  return '#' + hex;
};

export default generateDarkHexColor;
