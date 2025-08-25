const MAX_SIZE = 600;

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

const createThumbnail = async (fileBlob: Blob) => {
  const img = await createImageBitmap(fileBlob);
  
  const canvas = new OffscreenCanvas(MAX_SIZE, MAX_SIZE);
  const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context from canvas");
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return await canvas.convertToBlob({ type: "image/jpeg", quality: 0.7 });
};

export { dataURLtoBlob, createThumbnail };
