import React, { useState, useCallback } from 'react';
import { Upload, Music, Image as ImageIcon, X, Check, Loader2, FileAudio, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetStagingProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (generatedPath: string) => void;
}

export const AssetStaging: React.FC<AssetStagingProps> = ({ isOpen, onClose, onCommit }) => {
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAudioDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAudioFiles(Array.from(e.target.files));
    }
  };

  const processImage = (file: File) => {
    setIsProcessingImg(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 3000;
        canvas.height = 3000;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // High quality scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, 3000, 3000);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setCoverImage(dataUrl);
          setIsProcessingImg(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleCommit = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      onCommit("sftp://secure.aura-supply.com/uploads/batch_2025_verified");
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-4xl bg-slate-950 border border-slate-700 rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <Upload className="text-cyan-400" size={20} />
            <span className="font-mono font-bold text-slate-200">AURA::ASSET_STAGING_PROTOCOL</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Audio Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-400 uppercase text-xs font-bold tracking-wider">
              <Music size={14} />
              <span>Audio Master Ingestion</span>
            </div>
            
            <div className="border-2 border-dashed border-slate-800 rounded-lg p-8 hover:border-cyan-500/50 transition-colors bg-slate-900/20 group relative">
              <input 
                type="file" 
                multiple 
                accept=".wav,.flac,.aiff"
                onChange={handleAudioDrop}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                <FileAudio size={32} className="mb-4" />
                <span className="text-sm">DROP WAV/FLAC MASTERS HERE</span>
                <span className="text-xs text-slate-600 mt-2">Supports 24bit / 96kHz</span>
              </div>
            </div>

            <div className="space-y-2">
              {audioFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800 text-xs">
                  <span className="text-slate-300 truncate max-w-[200px]">{file.name}</span>
                  <span className="text-green-500 flex items-center"><Check size={10} className="mr-1"/> READY</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-400 uppercase text-xs font-bold tracking-wider">
              <ImageIcon size={14} />
              <span>Cover Art Processor</span>
            </div>

            <div className="border-2 border-dashed border-slate-800 rounded-lg p-1 relative bg-slate-900/20 min-h-[250px] flex items-center justify-center overflow-hidden group">
               {!coverImage && (
                 <>
                   <input 
                    type="file" 
                    accept=".jpg,.png,.jpeg"
                    onChange={handleImageDrop}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   />
                   <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors pointer-events-none">
                      <ImageIcon size={32} className="mb-4" />
                      <span className="text-sm">DROP COVER ART</span>
                      <span className="text-xs text-slate-600 mt-2">Auto-Resize to 3000x3000px</span>
                   </div>
                 </>
               )}

               {isProcessingImg && (
                 <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col z-20">
                   <Loader2 className="animate-spin text-cyan-400 mb-2" />
                   <span className="text-xs text-cyan-400 font-mono">RESIZING TO 3000px...</span>
                 </div>
               )}

               {coverImage && !isProcessingImg && (
                 <div className="relative w-full h-full group">
                   <img src={coverImage} alt="Cover" className="w-full h-full object-cover rounded" />
                   <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] text-green-400 border border-green-900 font-mono flex items-center">
                     <Check size={10} className="mr-1" /> 3000x3000px
                   </div>
                   <button 
                     onClick={() => setCoverImage(null)}
                     className="absolute top-2 right-2 bg-red-900/80 p-1 rounded hover:bg-red-800 text-white"
                   >
                     <X size={14} />
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/30 flex justify-end items-center space-x-4">
           <div className="text-xs text-slate-500 font-mono">
             {audioFiles.length} AUDIO TRACKS | {coverImage ? '1' : '0'} ARTWORK
           </div>
           <button 
             onClick={handleCommit}
             disabled={!coverImage || audioFiles.length === 0 || isUploading}
             className={`
               flex items-center space-x-2 px-6 py-2 rounded font-bold font-mono text-sm transition-all
               ${(!coverImage || audioFiles.length === 0) 
                 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                 : 'bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_15px_rgba(8,145,178,0.5)]'}
             `}
           >
             {isUploading ? (
               <>
                 <Loader2 className="animate-spin" size={16} />
                 <span>UPLOADING...</span>
               </>
             ) : (
               <>
                 <span>COMMIT TO SFTP</span>
                 <ArrowRight size={16} />
               </>
             )}
           </button>
        </div>
      </motion.div>
    </div>
  );
};