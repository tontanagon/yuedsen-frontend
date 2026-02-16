interface NavItemProps {
    icon: string;
    label: string;
    color: string;
    size?: 'normal' | 'large';
}

export default function NavItem({ icon, label, color, size = 'normal' }: NavItemProps) {
    const isLarge = size === 'large';
    const sizeClasses = isLarge ? "w-20 h-20 md:w-24 md:h-24" : "w-16 h-16 md:w-20 md:h-20";
    const iconSize = isLarge ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl";

    return (
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className={`${sizeClasses} ${color} rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2 border-[5px] border-white ring-2 ring-black/5`}>
                <span className={`text-white ${iconSize} drop-shadow-md`}>
                    {icon === 'bar_chart' && '📊'}
                    {icon === 'star' && '⭐'}
                    {icon === 'lightbulb' && '💡'}
                </span>
            </div>
            <span className="font-bold text-gray-800 text-base md:text-lg group-hover:text-black transition-colors bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">{label}</span>
        </div>
    );
}
