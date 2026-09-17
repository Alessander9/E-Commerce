import React, { useState, useRef, useEffect } from 'react';
import { Type, ChevronDown, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useFontSize, FontSizeLevel } from '../../hooks/useFontSize';

interface FontSizeSelectorProps {
  className?: string;
  variant?: 'compact' | 'expanded';
}

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { fontSize, setFontSize, increase, decrease, reset, options, currentOption } = useFontSize();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  if (variant === 'expanded') {
    return (
      <div className={`flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200/80 shadow-2xs ${className}`}>
        <button
          type="button"
          onClick={decrease}
          disabled={fontSize === 'sm'}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Reducir tamaño de fuente (A-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="px-2 py-0.5 text-xs font-black text-[#4F46E5] bg-indigo-50 rounded-lg min-w-[54px] text-center">
          {currentOption.percentage}
        </span>

        <button
          type="button"
          onClick={increase}
          disabled={fontSize === 'xl'}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Aumentar tamaño de fuente (A+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
        title="Ajustar tamaño de texto del dashboard"
      >
        <Type className="w-3.5 h-3.5 text-[#4F46E5] group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline text-[11px] font-bold text-slate-700">Texto:</span>
        <span className="text-[11px] font-black text-[#4F46E5]">
          {currentOption.shortLabel} ({currentOption.percentage})
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[285px] sm:w-72 max-w-[calc(100vw-1.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-100/80 p-3.5 z-50 animate-in fade-in zoom-in-95 text-xs space-y-2.5"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                <Type className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-900 text-xs">Tamaño de Fuente</span>
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-[11px] text-slate-400 hover:text-[#4F46E5] flex items-center gap-1 cursor-pointer font-bold transition-colors"
              title="Restablecer tamaño predeterminado"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 px-1 leading-relaxed">
            Personaliza el tamaño del texto para una lectura más cómoda. Todos los paneles y tablas se adaptan automáticamente.
          </p>

          <div className="space-y-1">
            {options.map((opt) => {
              const isSelected = fontSize === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => {
                    setFontSize(opt.level as FontSizeLevel);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#EEF2FF] text-[#4F46E5] font-black shadow-xs border border-indigo-100'
                      : 'text-slate-700 hover:bg-slate-50 font-semibold border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#4F46E5] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.shortLabel}
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold truncate leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
                        {opt.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {opt.percentage}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#4F46E5]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
