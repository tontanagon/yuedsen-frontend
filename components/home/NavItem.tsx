import Link from 'next/link';

interface NavItemProps {
    icon: string;
    label: string;
    color: string;
    size?: 'normal' | 'large';
    href?: string;
    labelColor?: string; // สีของ label text (optional, default เขียว)
}

export default function NavItem({ icon, label, color, size = 'normal', href, labelColor = '#2A6546' }: NavItemProps) {
    const isLarge = size === 'large';
    const sizeClasses = isLarge ? "w-14 h-14 md:w-16 md:h-16" : "w-12 h-12 md:w-14 md:h-14";
    const iconSize = isLarge ? "text-2xl md:text-3xl" : "text-xl md:text-2xl";

    const inner = (
        <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className={`${sizeClasses} ${color} rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1 border-[3px] border-white/90 ring-[6px] ring-white/40`}>
                <span className={`text-white ${iconSize} flex items-center justify-center`}>
                    {icon === 'bar_chart' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[60%] h-[60%]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    )}
                    {icon === 'star' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[60%] h-[60%]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    )}
                    {icon === 'lightbulb' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[60%] h-[60%]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    )}
                </span>
            </div>
            <span
                className="font-bold text-xs md:text-sm mt-1"
                style={{ color: labelColor, transition: 'color 0.5s ease' }}
            >
                {label}
            </span>
        </div>
    );

    if (href) {
        return <Link href={href}>{inner}</Link>;
    }

    return inner;
}
