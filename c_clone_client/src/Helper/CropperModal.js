import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';

const CropperModal = ({ imageSrc, onClose, onCropComplete,profileLoading }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 9999 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          showGrid={false}
          cropShape="round"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
        <div style={{ position: 'absolute', bottom: '80px', width: '100%', padding: '0 20px' }}>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
            className="form-range"
          />
        </div>
        <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
          <button onClick={handleDone} className="btn btn-primary me-2">{profileLoading ? 'Uploading...' : 'Crop & Upload'}</button>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
