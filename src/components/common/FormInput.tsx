'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaExclamationCircle, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

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

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  validation?: ValidationRules;
  showValidationIcon?: boolean;
  errorMessage?: string;
  validationTrigger?: 'onChange' | 'onBlur' | 'onSubmit';
  onValidationChange?: (isValid: boolean) => void;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  validation,
  showValidationIcon = true,
  errorMessage,
  validationTrigger = 'onBlur',
  onValidationChange,
  required,
  className = '',
  ...props
}) => {
  const [value, setValue] = useState(props.value?.toString() || '');
  const [isTouched, setIsTouched] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage || null);
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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
  
  // パスワード表示切り替え
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // フォーカスを維持
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // 実際の入力タイプを決定
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2
            ${error && isTouched 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : isValid && isTouched 
                ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${(type === 'password') ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* パスワードの表示切り替えアイコン */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabIndex={-1}
          >
            {showPassword ? (
              <FaEyeSlash className="h-5 w-5 text-gray-400" />
            ) : (
              <FaEye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        )}
        
        {/* バリデーションアイコン (パスワードタイプ以外) */}
        {showValidationIcon && type !== 'password' && isTouched && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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

export default FormInput; 