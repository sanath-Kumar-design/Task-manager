export default function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const size = Math.min(image.width, image.height);
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(
        image,
        crop.x * image.width / 100,
        crop.y * image.height / 100,
        size,
        size,
        0,
        0,
        size,
        size
      );

      resolve(canvas.toDataURL("image/jpeg"));
    };
    image.onerror = reject;
  });
}
