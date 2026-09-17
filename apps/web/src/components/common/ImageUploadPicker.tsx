import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, FileImage, Sparkles, RefreshCw } from 'lucide-react';

interface ImageUploadPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  value,
  onChange,
  label = 'Imagen Principal del Producto',
  placeholder = 'https://images.unsplash.com/...',
  className = '',
}) => {
  const [mode, setMode] = useState<'file' | 'url'>(() => {
    // If initial value is base64, start in 'file' mode, else 'file' by default if empty or 'url' if starts with http
    if (value && value.startsWith('data:image/')) return 'file';
    if (value && (value.startsWith('http://') || value.startsWith('https://'))) return 'url';
    return 'file';
  });

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>(value || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP, SVG).');
      return;
    }

    // Validate size (max 8MB for base64 storage)
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('La imagen no debe superar los 8MB.');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    setFileName(file.name);
    setFileSize(sizeFormatted);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error al leer el archivo. Intenta con otra imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    onChange(val);
    setErrorMessage(null);
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setFileName('');
    setFileSize('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header and Mode Selector */}
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 block text-xs">
          {label}
        </label>
        
        {/* Toggle Mode Buttons */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              mode === 'file'
                ? 'bg-white text-[#4F46E5] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Archivo</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              mode === 'url'
                ? 'bg-white text-[#4F46E5] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Enlace URL</span>
          </button>
        </div>
      </div>

      {/* Mode 1: File Upload */}
      {mode === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {!value ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                isDragging
                  ? 'border-[#4F46E5] bg-indigo-50/60 scale-[0.99]'
                  : 'border-slate-200 bg-white hover:border-[#4F46E5]/60 hover:bg-slate-50/80 shadow-2xs'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#4F46E5] group-hover:text-white transition-all shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  <span className="text-[#4F46E5] underline decoration-indigo-300 underline-offset-2">Haz clic para examinar</span> o arrastra tu imagen
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  PNG, JPG, WEBP o SVG (máx. 8MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-2xs">
                  <img src={value} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {fileName || 'Imagen cargada'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Lista
                    </span>
                  </div>
                  {fileSize && (
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {fileSize}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Cambiar</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
                  title="Eliminar imagen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Direct URL */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder={placeholder}
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs text-xs"
            />
            {urlInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {value && value.startsWith('http') && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-2xs">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-2xs">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-800 block truncate">
                  Vista previa de URL web
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  {value}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] text-[10px] font-black border border-indigo-100">
                ONLINE
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <p className="text-[11px] font-bold text-rose-600 animate-in fade-in">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
