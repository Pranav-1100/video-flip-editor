// src/components/Preview.js
import React, { useRef, useEffect, useState } from 'react';

const Preview = ({ cropperData, videoRef }) => {
  const [preview, setPreview] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const captureFrame = () => {
      if (videoRef.current && cropperData.width && cropperData.height) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const { videoWidth, videoHeight } = videoRef.current.getInternalPlayer();
        const scaleWidth = videoWidth / videoRef.current.wrapper.clientWidth;
        const scaleHeight = videoHeight / videoRef.current.wrapper.clientHeight;

        canvas.width = cropperData.width * scaleWidth;
        canvas.height = cropperData.height * scaleHeight;

        ctx.drawImage(
          videoRef.current.getInternalPlayer(),
          cropperData.x * scaleWidth,
          cropperData.y * scaleHeight,
          cropperData.width * scaleWidth,
          cropperData.height * scaleHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        setPreview(canvas.toDataURL('image/png'));
      }
      animationFrameId = requestAnimationFrame(captureFrame);
    };

    captureFrame();

    return () => cancelAnimationFrame(animationFrameId);
  }, [cropperData, videoRef]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {preview && <img src={preview} alt="Preview" style={{ width: '100%' }} />}
    </div>
  );
};

export default Preview;
