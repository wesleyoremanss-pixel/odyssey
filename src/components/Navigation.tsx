'use client';

export default function Navigation({ isMobile }: { isMobile: boolean }) {
    const links = ['Journal', 'About', 'Tours', 'Contact'];

    return (
        <nav className={`flex ${isMobile ? 'flex-col items-center' : 'flex-row'} gap-8 md:gap-12 z-[200]`}>
            {links.map((link) => (
                <div
                    key={link}
                    className="relative cursor-pointer group"
                >
                    <span className="font-[family-name:var(--font-cormorant)] text-xl md:text-sm uppercase tracking-[0.2em] text-[#E5E0D8]/80 group-hover:text-white transition-colors duration-300">
                        {link}
                    </span>
                    <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-orange-500 group-hover:w-full transition-all duration-300 ease-out" />
                </div>
            ))}
        </nav>
    );
}
