import React from 'react';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'datetime-local' | 'select';

interface BaseInputProps {
  label: string;
  id?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface TextInputProps extends BaseInputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'datetime-local';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

interface SelectInputProps extends BaseInputProps {
  type: 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
}

type InputProps = TextInputProps | SelectInputProps;

export const Input: React.FC<InputProps> = (props) => {
  const { label, id, error, required, className = '' } = props;
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  const baseInputClasses = `mt-1 block w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
  }`;

  return (
    <div className={className}>
      <label 
        htmlFor={inputId} 
        className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {props.type === 'select' ? (
        <select
          id={inputId}
          value={props.value}
          onChange={props.onChange}
          required={required}
          className={baseInputClasses}
        >
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={props.type}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          required={required}
          min={props.min}
          max={props.max}
          step={props.step}
          className={baseInputClasses}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};