import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth ? 'btn-full' : '',
        isLoading ? 'btn-loading' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <span className="btn-spinner" aria-hidden="true" />
                    <span className="btn-loading-text">{children}</span>
                </>
            ) : (
                <>
                    {leftIcon && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
                    <span className="btn-content">{children}</span>
                    {rightIcon && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
                </>
            )}
        </button>
    );
};
