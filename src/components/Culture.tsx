'use client';

export default function Culture() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center bg-[#1a0505] text-white py-20">
            <div className="max-w-5xl px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="font-serif text-5xl md:text-7xl mb-6">
                        Timeless <br /> Culture
                    </h2>
                    <div className="w-20 h-1 bg-yellow-600 mb-8" />
                    <p className="text-lg text-white/70 leading-relaxed">
                        From the spiritual temples of Bali to the elaborate funeral rites of Toraja.
                        Immerse yourself in traditions that have withstood the test of time.
                    </p>
                    <button className="mt-10 px-8 py-4 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-300 font-medium">
                        Explore Heritage
                    </button>
                </div>

                <div className="relative h-[500px] w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-4">
                    {/* Abstract Pattern / Image Placeholder */}
                    <div className="w-full h-full rounded-full bg-pattern-batik opacity-50 animate-spin-slow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-serif text-9xl opacity-10">OM</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
