import Image from "next/image";

type Props = {
    fullScreen?: boolean;
    logo?: boolean;
    ring?: boolean;
    message?: string;
    className?: string;
    backgroundClassName?: string;
};

function LoadingDots() {
    return (
        <span className="inline-flex w-[18px] justify-start" aria-hidden="true">
            <span className="spabar-dot spabar-dot-1">.</span>
            <span className="spabar-dot spabar-dot-2">.</span>
            <span className="spabar-dot spabar-dot-3">.</span>
        </span>
    );
}

export function SpabarLoader({
    fullScreen = true,
    logo = true,
    ring = true,
    // ✅ mensaje por defecto SIN puntos
    message = "Cargando",
    className = "",
    backgroundClassName = "bg-gradient-to-br from-purple-500 to-blue-600",
}: Props) {
    const inner = (
        <div
            className={[
                "grid place-items-center gap-[14px] px-[22px] py-[20px]",
                className,
            ].join(" ")}
            role="status"
            aria-live="polite"
        >
            <div className="relative h-[90px] w-[170px]" aria-hidden="true">
                {/* Ring */}
                {ring && (
                    <>
                        <div
                            className={[
                                "absolute inset-0 rounded-full opacity-90 animate-spabar-spin",
                                "bg-[conic-gradient(from_180deg,rgba(255,255,255,0)_0deg,rgba(255,255,255,0.95)_70deg,rgba(255,255,255,0)_310deg)]",
                                "spabar-ring-mask",
                            ].join(" ")}
                        />
                        {/* glow suave detrás */}
                        <div className="absolute inset-0 rounded-full blur-[14px] opacity-35 animate-spabar-glow bg-white/40" />
                    </>
                )}

                {/* Logo zoom in/out */}
                {logo && (
                    <div className="absolute inset-0 grid place-items-center animate-spabar-logoZoom">
                        <Image
                            src="/spabar-logo.png"
                            alt="Spabar"
                            width={820}
                            height={400}
                            priority
                            className="w-[185px] h-auto object-contain brightness-0 invert drop-shadow-[0_12px_22px_rgba(0,0,0,0.28)]"
                        />
                    </div>
                )}
            </div>

            {/* Texto + dots animados */}
            <p className="text-[18px] font-medium tracking-[0.3px] text-white/95">
                {message}
                <LoadingDots />
            </p>

            <span className="sr-only">{`${message}`}</span>
        </div>
    );

    if (!fullScreen) return inner;

    return (
        <div
            className={[
                "fixed inset-0 z-[9999] grid place-items-center",
                backgroundClassName,
            ].join(" ")}
        >
            {inner}
        </div>
    );
}
