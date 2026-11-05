import { AttendanceRecord } from '@/app/types'
import DayTrack from '@/components/ui/DayTrack'

type AttendanceTableProps = {
    records: AttendanceRecord[]
}

export default function AttendanceTable({ records }: AttendanceTableProps) {
    const pad2 = (n: number) => String(n).padStart(2, '0')
    const hoursToHHMMSS = (hours: number) => {
        const total = Math.round(hours * 3600)
        const h = Math.floor(total / 3600)
        const m = Math.floor((total % 3600) / 60)
        const s = total % 60
        return `${pad2(h)}:${pad2(m)}:${pad2(s)}`
    }
    const minutesToHHMMSS = (minutes: number) => hoursToHHMMSS(minutes / 60)

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-sm">
                <thead>
                    <tr>
                        <th scope="col" className="data-th">Nombre</th>
                        <th scope="col" className="data-th">Fecha</th>
                        <th scope="col" className="data-th w-[220px]">Jornada · 06 a 22 h</th>
                        <th scope="col" className="data-th">Entrada</th>
                        <th scope="col" className="data-th">Salida</th>
                        <th scope="col" className="data-th">Hrs trab</th>
                        <th scope="col" className="data-th">Tardanza</th>
                        <th scope="col" className="data-th">Hrs extra</th>
                        <th scope="col" className="data-th">Alerta</th>
                        <th scope="col" className="data-th">Semana</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record, idx) => (
                        <tr key={idx} className="data-row">
                            <td className="data-td py-[18px]">{record.nombre}</td>
                            <td className="data-td data-num text-spa-muted">{record.fecha}</td>
                            <td className="data-td">
                                <DayTrack start={record.entradaReal} end={record.salidaReal} alert={Boolean(record.alerta)} />
                            </td>
                            <td className="data-td data-num">{record.entradaReal}</td>
                            <td className="data-td data-num">{record.salidaReal}</td>
                            <td className="data-td data-num">{hoursToHHMMSS(record.horasTrabajadas)}</td>
                            <td className={`data-td data-num ${record.alerta ? 'text-spa-alert' : record.minTardanza > 0 ? '' : 'text-spa-muted'}`}>
                                {minutesToHHMMSS(record.minTardanza)}
                            </td>
                            <td className="data-td data-num">{hoursToHHMMSS(record.horasExtra)}</td>
                            <td className="data-td">
                                {record.alerta && (
                                    <span className="inline-block text-xs font-medium lowercase text-spa-alert first-letter:uppercase">
                                        {record.alerta}
                                    </span>
                                )}
                            </td>
                            <td className="data-td data-num text-spa-muted">{record.semana}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
