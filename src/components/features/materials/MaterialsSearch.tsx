'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface MaterialsSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function MaterialsSearch({ 
  onSearch, 
  placeholder = "教材を検索..." 
}: MaterialsSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 検索候補（実際のアプリケーションではAPIから取得）
  const suggestions = [
    'be動詞',
    '現在進行形',
    '過去形',
    '未来形',
    '助動詞',
    '現在完了',
    '受動態',
    '不定詞',
    '動名詞',
    '関係代名詞'
  ];

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
    
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch('');
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative" ref={inputRef}>
      {/* 検索入力フィールド */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (query.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm hover:shadow-md transition-all duration-200 placeholder-gray-400"
        />
        
        {/* 検索アイコン */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <FaSearch className="text-gray-400 text-sm" />
        </div>
        
        {/* クリアボタン */}
        {query.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>

      {/* 検索候補ドロップダウン */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-2">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 