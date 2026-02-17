interface NavItemProps {
    icon: string;
    label: string;
    color: string;
    size?: 'normal' | 'large';
}

export default function NavItem({ icon, label, color, size = 'normal' }: NavItemProps) {
    const isLarge = size === 'large';
    const sizeClasses = isLarge ? "w-14 h-14 md:w-16 md:h-16" : "w-12 h-12 md:w-14 md:h-14";
    const iconSize = isLarge ? "text-2xl md:text-3xl" : "text-xl md:text-2xl";

    return (
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className={`${sizeClasses} ${color} rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2 border-[3px] border-white ring-2 ring-black/5`}>
                <span className={`text-white ${iconSize} drop-shadow-md`}>
                    {icon === 'bar_chart' && '📊'}
                    {icon === 'star' && '⭐'}
                    {icon === 'lightbulb' && '💡'}
                </span>
            </div>
            <span className="font-bold text-gray-800 text-sm md:text-base group-hover:text-black transition-colors bg-white/50 px-2 py-1 rounded-full backdrop-blur-sm">{label}</span>
        </div>
    );
}
