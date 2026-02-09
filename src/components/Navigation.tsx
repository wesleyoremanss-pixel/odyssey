'use client';

export default function Navigation({ isMobile }: { isMobile: boolean }) {
    const links = ['Beaches', 'Volcanoes', 'Animals', 'Culture', 'Gastronomy', 'Islands'];

    return (
        <nav className={`flex flex-col gap-4 text-[#E5E0D8]`}>
            {links.map((link) => (
                <div key={link} className="cursor-pointer uppercase tracking-widest text-sm hover:text-white transition-colors font-sans w-max">
                    {link}
                </div>
            ))}
        </nav>
    );
}
