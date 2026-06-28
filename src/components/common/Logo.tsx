import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  withText?: boolean;
  to?: string;
}

export default function Logo({ className = '', withText = true, to = '/' }: LogoProps) {
  return (
    <Link to={to} className={`flex items-center gap-2 group ${className}`}>
      <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform group-hover:scale-105">
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {/* Main upward stroke (Amber) */}
        <path d="M 12 84 L 12 88 L 34 88 L 88 16 L 88 12 L 66 12 Z" fill="url(#brandGrad)"/>
        
        {/* Top-left crossing stroke (White) */}
        <path d="M 12 16 L 12 12 L 34 12 L 45 26.67 L 32.5 43.33 Z" fill="#ffffff"/>
        
        {/* Bottom-right crossing stroke (Soft Gray) */}
        <path d="M 88 84 L 88 88 L 66 88 L 55 73.33 L 67.5 56.67 Z" fill="#e5e5e5"/>
      </svg>
      {withText && (
        <span className="text-xl font-bold tracking-tight text-white uppercase font-heading">
          Stake<span className="text-brand-500">X</span>
        </span>
      )}
    </Link>
  );
}
