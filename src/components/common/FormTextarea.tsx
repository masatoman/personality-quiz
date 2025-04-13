'use client';

import React, { useState, useEffect } from 'react';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

export type ValidationRule = {
  test: (value: string) => boolean;
  message: string;
};

export type ValidationRules = {
  required?: { value: boolean; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  custom?: ValidationRule[];
};

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  validation?: ValidationRules;
  showValidationIcon?: boolean;
  errorMessage?: string;
  validationTrigger?: 'onChange' | 'onBlur' | 'onSubmit';
  onValidationChange?: (isValid: boolean) => void;
  showCharCount?: boolean;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  validation,
  showValidationIcon = true,
  errorMessage,
  validationTrigger = 'onBlur',
  onValidationChange,
  required,
  className = '',
  showCharCount = false,
  maxLength,
  rows = 4,
  ...props
}) => {
  const [value, setValue] = useState(props.value?.toString() || '');
  const [isTouched, setIsTouched] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage || null);
  const [isValid, setIsValid] = useState(false);
  
  // 外部から渡されたバリューの変更を監視
  useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value.toString());
    }
  }, [props.value]);
  
  // 外部から渡されたエラーメッセージの変更を監視
  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
      setIsValid(false);
    }
  }, [errorMessage]);
  
  // バリデーション関数
  const validate = (valueToValidate: string): string | null => {
    if (!validation) return null;
    
    // 必須チェック
    if (validation.required?.value && !valueToValidate.trim()) {
      return validation.required.message;
    }
    
    // 最小文字数チェック
    if (validation.minLength && valueToValidate.length < validation.minLength.value) {
      return validation.minLength.message;
    }
    
    // 最大文字数チェック
    if (validation.maxLength && valueToValidate.length > validation.maxLength.value) {
      return validation.maxLength.message;
    }
    
    // パターンチェック
    if (validation.pattern && !validation.pattern.value.test(valueToValidate)) {
      return validation.pattern.message;
    }
    
    // カスタムバリデーション
    if (validation.custom) {
      for (const rule of validation.custom) {
        if (!rule.test(valueToValidate)) {
          return rule.message;
        }
      }
    }
    
    return null;
  };
  
  // 入力変更時の処理
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // onChange時にバリデーションを実行
    if (validationTrigger === 'onChange') {
      const validationError = validate(newValue);
      setError(validationError);
      setIsValid(!validationError);
      if (onValidationChange) {
        onValidationChange(!validationError);
      }
    }
    
    // 親コンポーネントのonChangeを呼び出す
    if (props.onChange) {
      props.onChange(e);
    }
  };
  
  // フォーカスを失った時の処理
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsTouched(true);
    
    // onBlur時にバリデーションを実行
    if (validationTrigger === 'onBlur') {
      const validationError = validate(value);
      setError(validationError);
      setIsValid(!validationError);
      if (onValidationChange) {
        onValidationChange(!validationError);
      }
    }
    
    // 親コンポーネントのonBlurを呼び出す
    if (props.onBlur) {
      props.onBlur(e);
    }
  };
  
  // 文字数が制限に近づいているかの判定
  const getCharCountColor = () => {
    if (!maxLength) return 'text-gray-500';
    
    const percent = (value.length / Number(maxLength)) * 100;
    if (percent >= 90) return 'text-red-500';
    if (percent >= 75) return 'text-yellow-500';
    return 'text-gray-500';
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {/* 文字数カウント */}
        {showCharCount && maxLength && (
          <span className={`text-xs ${getCharCountColor()}`}>
            {value.length} / {maxLength}
          </span>
        )}
      </div>
      
      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2
            ${error && isTouched 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : isValid && isTouched 
                ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${className}
          `}
          {...props}
        />
        
        {/* バリデーションアイコン */}
        {showValidationIcon && isTouched && (
          <div className="absolute top-2 right-2 pointer-events-none">
            {error ? (
              <FaExclamationCircle className="h-5 w-5 text-red-500" />
            ) : value ? (
              <FaCheckCircle className="h-5 w-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>
      
      {/* エラーメッセージ */}
      {error && isTouched && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormTextarea; 