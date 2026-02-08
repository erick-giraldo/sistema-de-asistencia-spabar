import { AttendanceRecord } from '@/app/types'

type AttendanceTableProps = {
    records: AttendanceRecord[]
}

export default function AttendanceTable({ records }: AttendanceTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entrada
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Salida
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hrs Trab
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tardanza
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hrs Extra
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Alerta
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Semana
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record, idx) => (
                        <tr key={idx} className={record.alerta ? 'bg-red-50' : 'hover:bg-gray-50'}>
                            <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                {record.nombre}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                                {record.fecha}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                                {record.entradaReal}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                                {record.salidaReal}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                                {record.horasTrabajadas}h
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                                {record.minTardanza}m
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                                {record.horasExtra}h
                            </td>
                            <td className="px-3 py-3 text-sm whitespace-nowrap">
                                {record.alerta && (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
                                        {record.alerta}
                                    </span>
                                )}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                                {record.semana}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}