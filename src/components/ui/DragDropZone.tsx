import { useState, useCallback, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';

interface DragDropZoneProps {
  onFileDrop: (filePath: string) => void;
  accept?: string;
  className?: string;
}

export function DragDropZone({ onFileDrop, accept = '.dll', className = '' }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const dllFile = files.find((file) => file.name.toLowerCase().endsWith('.dll'));

      if (dllFile) {
        // @ts-expect-error - Tauri adds path property to File
        const filePath = dllFile.path || dllFile.name;
        onFileDrop(filePath);
      }
    },
    [onFileDrop]
  );

  return (
    <motion.div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8
        transition-all duration-200
        ${isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-white/20 bg-white/5'}
        ${className}
      `}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-xl flex items-center justify-center"
          >
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2 text-[var(--color-primary)]" />
              <p className="text-white font-medium">Drop DLL file here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center pointer-events-none">
        <Upload className="w-10 h-10 mx-auto mb-3 text-white/40" />
        <p className="text-white/60 text-sm">
          Drag & drop a {accept} file here, or click to browse
        </p>
      </div>
    </motion.div>
  );
}
