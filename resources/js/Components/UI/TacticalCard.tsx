import React from 'react';

interface TacticalCardProps {
    title?: React.ReactNode;
    subtitle?: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    glow?: 'gold' | 'blue' | 'red' | 'none';
}

export const TacticalCard: React.FC<TacticalCardProps> = ({
    title,
    subtitle,
    icon,
    badge,
    actions,
    children,
    className = '',
    glow = 'none',
}) => {
    const glowClass = {
        gold: 'border-[#c5a059]/50 shadow-sm',
        blue: 'border-sky-500/50 shadow-sm',
        red: 'border-rose-500/50 shadow-sm',
        none: 'border-[#223750]',
    }[glow];

    return (
        <div className={`bg-[#132235] border rounded-lg shadow-sm ${glowClass} ${className}`}>
            {(title || actions || badge) && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#223750] bg-[#0f1b2b]">
                    <div className="flex items-center gap-2.5">
                        {icon && <div className="text-[#c5a059]">{icon}</div>}
                        <div>
                            {title && <h3 className="text-sm font-semibold text-slate-100 font-sans">{title}</h3>}
                            {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-sans">{subtitle}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {badge}
                        {actions}
                    </div>
                </div>
            )}
            <div className="p-4">{children}</div>
        </div>
    );
};
