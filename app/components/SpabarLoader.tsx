import Image from "next/image";

type Props = {
    fullScreen?: boolean;
    message?: string;
    className?: string;
    backgroundClassName?: string;
    logoSrc?: string;
};

export function SpabarLoader({
    fullScreen = true,
    message = "",
    className = "",
    backgroundClassName = "bg-white",
    logoSrc = "/spabar-logo.gif",
}: Props) {
    const inner = (
        <div
            className={[
                "grid place-items-center gap-6 px-6 py-6",
                !fullScreen ? backgroundClassName : "",
                className
            ].filter(Boolean).join(" ")}
            role="status"
            aria-live="polite"
        >
            <div className="relative grid place-items-center" aria-hidden="true">
                <div className="relative w-[360px] h-[150px] sm:w-[520px] sm:h-[200px] bg-white">
                    {/* Ghost izquierda (gris + recorte) */}
                    <div className="absolute inset-0 spabar-ghost spabar-ghost-left spabar-slice-left bg-white">
                        <Image
                            src={logoSrc}
                            alt=""
                            fill
                            priority
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    {/* Ghost derecha (gris + recorte) */}
                    <div className="absolute inset-0 spabar-ghost spabar-ghost-right spabar-slice-right bg-white">
                        <Image
                            src={logoSrc}
                            alt=""
                            fill
                            priority
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    {/* Principal (negro) - se repite 2 veces */}
                    <div className="absolute inset-0 spabar-main spabar-anim-gif-repeat bg-white">
                        <Image
                            src={logoSrc}
                            alt="Spabar"
                            fill
                            priority
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>
            </div>

            {/* Texto opcional */}
            {message ? (
                <p className="text-[22px] font-semibold tracking-[0.2px] text-black/80">
                    {message}
                    <span className="spabar-dots" aria-hidden="true">...</span>
                </p>
            ) : null}

            <span className="sr-only">{message || "Cargando"}</span>
        </div>
    );

    if (!fullScreen) return inner;

    return (
        <div className={["fixed inset-0 z-[9999] grid place-items-center", backgroundClassName].join(" ")}>
            {inner}
        </div>
    );
}