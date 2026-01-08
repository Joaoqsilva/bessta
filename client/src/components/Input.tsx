import React, { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: 'default' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    variant = 'default',
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                    {props.required && <span className="input-required">*</span>}
                </label>
            )}
            <div className={`input-wrapper ${hasError ? 'input-wrapper-error' : ''} input-wrapper-${variant}`}>
                {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}
                <input
                    ref={ref}
                    id={inputId}
                    className={`input ${leftIcon ? 'input-with-left-icon' : ''} ${rightIcon ? 'input-with-right-icon' : ''}`}
                    {...props}
                />
                {rightIcon && <span className="input-icon input-icon-right">{rightIcon}</span>}
            </div>
            {error && <span className="input-error">{error}</span>}
            {hint && !error && <span className="input-hint">{hint}</span>}
        </div>
    );
});

Input.displayName = 'Input';

// TextArea Component
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
    label,
    error,
    hint,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                    {props.required && <span className="input-required">*</span>}
                </label>
            )}
            <div className={`input-wrapper ${hasError ? 'input-wrapper-error' : ''}`}>
                <textarea
                    ref={ref}
                    id={inputId}
                    className="input textarea"
                    {...props}
                />
            </div>
            {error && <span className="input-error">{error}</span>}
            {hint && !error && <span className="input-hint">{hint}</span>}
        </div>
    );
});

TextArea.displayName = 'TextArea';

// Select Component
interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
    label,
    error,
    options,
    placeholder = 'Select an option',
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                    {props.required && <span className="input-required">*</span>}
                </label>
            )}
            <div className={`input-wrapper select-wrapper ${hasError ? 'input-wrapper-error' : ''}`}>
                <select
                    ref={ref}
                    id={inputId}
                    className="input select"
                    {...props}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <span className="select-chevron">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </div>
            {error && <span className="input-error">{error}</span>}
        </div>
    );
});

Select.displayName = 'Select';
