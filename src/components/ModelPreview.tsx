import React from 'react';
import '@google/model-viewer';

// Definimos la interfaz si usas TypeScript
interface ModelPreviewProps {
  modelPath: string;
}

const ModelPreview: React.FC<ModelPreviewProps> = ({ modelPath }) => {
  return (
    <div className="w-full h-80 bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      <model-viewer
        src={modelPath}
        alt="Visualización del cromo 3D"
        auto-rotate
        camera-controls
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        style={{ width: '100%', height: '100%' }}
      >
      </model-viewer>
    </div>
  );
};

export default ModelPreview;