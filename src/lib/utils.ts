const dataURLtoBlob = (dataURL: string) => {
  // Split into "metadata" and the actual Base64 data
  const [header, base64Data] = dataURL.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";

  // Decode Base64 into raw binary
  const byteString = atob(base64Data);

  // Convert binary string to Uint8Array
  const arrayBuffer = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    arrayBuffer[i] = byteString.charCodeAt(i);
  }

  // Wrap in a Blob so it acts like a file
  return new Blob([arrayBuffer], { type: mime });
};

export { dataURLtoBlob };
