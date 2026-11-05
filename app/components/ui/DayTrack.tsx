const AXIS_START_SECONDS = 6 * 3600
const AXIS_LENGTH_SECONDS = 16 * 3600

export const DAY_TRACK_HOURS = ['06', '10', '14', '18', '22']

function toSeconds(time?: string) {
    if (!time) return null
    const [hours, minutes, seconds = 0] = time.split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) return null
    return hours * 3600 + minutes * 60 + seconds
}

function toAxisPercent(seconds: number) {
    const percent = ((seconds - AXIS_START_SECONDS) / AXIS_LENGTH_SECONDS) * 100
    return Math.min(100, Math.max(0, percent))
}

type DayTrackProps = {
    start?: string
    end?: string
    alert?: boolean
}

// Dibuja una jornada sobre el eje de 06:00 a 22:00. Es decorativa: las horas también aparecen como texto.
export default function DayTrack({ start, end, alert = false }: DayTrackProps) {
    const startSeconds = toSeconds(start)
    const endSeconds = toSeconds(end)
    const hasRange = startSeconds !== null && endSeconds !== null && endSeconds > startSeconds
    const left = hasRange ? toAxisPercent(startSeconds) : 0
    const right = hasRange ? toAxisPercent(endSeconds) : 0

    return (
        <div aria-hidden="true" className="relative h-1 min-w-[160px] rounded-sm bg-spa-track">
            {hasRange && (
                <div
                    className={`absolute top-0 h-1 rounded-sm ${alert ? 'bg-spa-alert' : 'bg-spa-accent'}`}
                    style={{ left: `${left}%`, width: `${right - left}%` }}
                />
            )}
        </div>
    )
}
