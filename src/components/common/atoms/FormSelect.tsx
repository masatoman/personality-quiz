'use client';

import React, { useState, useEffect } from 'react';
import { FaExclamationCircle, FaCheckCircle, FaChevronDown } from 'react-icons/fa';

export type SelectOption = {
  value: string;
  label: string;
};

export type ValidationRules = {
  required?: { value: boolean; message: string };
};

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  name: string;
  options: SelectOption[];
  validation?: ValidationRules;
  showValidationIcon?: boolean;
  errorMessage?: string;
  validationTrigger?: 'onChange' | 'onBlur' | 'onSubmit';
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  options,
  validation,
  showValidationIcon = true,
  errorMessage,
  validationTrigger = 'onChange',
  onChange,
  onValidationChange,
  required,
  className = '',
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
    if (validation.required?.value && !valueToValidate) {
      return validation.required.message;
    }
    
    return null;
  };
  
  // 選択変更時の処理
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    if (onChange) {
      onChange(newValue);
    }
  };
  
  // フォーカスを失った時の処理
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
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
  };
  
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
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          className={`
            appearance-none w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2
            ${error && isTouched 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : isValid && isTouched 
                ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${className}
          `}
          {...props}
        >
          {/* デフォルトオプション */}
          <option value="" disabled>選択してください</option>
          
          {/* オプションリスト */}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* セレクトドロップダウンアイコン */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <FaChevronDown className="h-4 w-4 text-gray-500" />
        </div>
        
        {/* バリデーションアイコン */}
        {showValidationIcon && isTouched && (
          <div className="absolute inset-y-0 right-7 flex items-center pointer-events-none">
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

export default FormSelect; 