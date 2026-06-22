import React from 'react';
import { bus } from '../../contexts/EventBus.js';
import './Button.css';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  href,
  download,
  target,
  rel,
  'aria-label': ariaLabel,
  ...props
}) {
  const baseClasses = `neon-btn neon-btn-${variant} ${className}`;

  const handleClick = (e) => {
    bus.emit('audio:click');
    if (onClick) {
      onClick(e);
    }
  };

  const commonProps = {
    className: baseClasses,
    'aria-label': ariaLabel,
    onClick: handleClick,
    ...props,
  };

  if (href) {
    const isExternal = target === '_blank' || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:');
    return (
      <a
        href={href}
        download={download}
        target={target || (isExternal ? '_blank' : undefined)}
        rel={rel || (isExternal ? 'noopener noreferrer' : undefined)}
        {...commonProps}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      {...commonProps}
    >
      {children}
    </button>
  );
}
