import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

interface SearchableMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Search and select...',
  allowCustom = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selected.includes(option)
  );

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  const handleAddCustom = () => {
    if (searchTerm.trim() && !selected.includes(searchTerm.trim())) {
      onChange([...selected, searchTerm.trim()]);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          inputRef.current?.focus();
        }}
        className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-sky-400/25 bg-blue-950/70 focus-within:bg-blue-900/80 focus-within:border-cyan-400 transition-all cursor-pointer"
      >
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/20 text-cyan-300 border border-sky-400/30 rounded-lg text-xs font-bold"
            >
              {item}
              <X
                className="w-3 h-3 cursor-pointer hover:text-white"
                onClick={(e) => removeOption(item, e)}
              />
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (allowCustom && searchTerm.trim()) {
                  handleAddCustom();
                }
              }
            }}
            className="flex-1 min-w-[100px] bg-transparent outline-none text-xs font-bold text-white placeholder:text-slate-400"
            placeholder={selected.length === 0 ? placeholder : ''}
          />
        </div>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#091b48] rounded-xl border border-sky-400/30 shadow-2xl max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option}
                onClick={() => toggleOption(option)}
                className="px-4 py-2 text-xs font-bold text-slate-200 hover:bg-sky-500/20 cursor-pointer flex items-center justify-between"
              >
                {option}
                {selected.includes(option) && (
                  <Check className="w-4 h-4 text-cyan-400" />
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-xs font-bold text-slate-400">
              No options found
            </div>
          )}
          {allowCustom && searchTerm.trim() && !selected.includes(searchTerm.trim()) && (
            <div
              onClick={handleAddCustom}
              className="px-4 py-2 text-xs font-bold text-cyan-400 hover:bg-sky-500/20 cursor-pointer border-t border-sky-400/20"
            >
              + Add "{searchTerm.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableMultiSelect;
