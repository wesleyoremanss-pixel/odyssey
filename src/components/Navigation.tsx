'use client';

export default function Navigation({ isMobile }: { isMobile: boolean }) {
    const links = ['Journal', 'About', 'Tours', 'Contact'];

    return (
        <nav className={`flex ${isMobile ? 'flex-col items-center' : 'flex-row'} gap-6 text-[#E5E0D8]`}>
            {links.map((link) => (
                <div key={link} className="cursor-pointer uppercase tracking-widest text-sm hover:text-white transition-colors font-sans">
                    {link}
                </div>
            ))}
        </nav>
    );
}
