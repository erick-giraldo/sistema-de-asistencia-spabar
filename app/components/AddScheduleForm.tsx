import { Schedule } from '@/app/types'

type AddScheduleFormProps = {
    schedule: Partial<Schedule>
    onChange: (schedule: Partial<Schedule>) => void
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
}

export default function AddScheduleForm({ schedule, onChange, onSubmit, onCancel }: AddScheduleFormProps) {
    return (
        <form onSubmit={onSubmit} className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Nuevo Horario</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={schedule.name || ''}
                        onChange={(e) => onChange({ ...schedule, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Nombre del empleado"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento
                    </label>
                    <input
                        type="text"
                        value={schedule.department || ''}
                        onChange={(e) => onChange({ ...schedule, department: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: Spabar"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horas Programadas
                    </label>
                    <input
                        type="number"
                        value={schedule.scheduledHours || ''}
                        onChange={(e) => onChange({ ...schedule, scheduledHours: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="9"
                        min="0"
                        step="0.5"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de Entrada
                    </label>
                    <input
                        type="time"
                        step="1"
                        value={schedule.entryTime?.substring(0, 5) || ''}
                        onChange={(e) => onChange({ ...schedule, entryTime: e.target.value + ':00' })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de Salida
                    </label>
                    <input
                        type="time"
                        step="1"
                        value={schedule.exitTime?.substring(0, 5) || ''}
                        onChange={(e) => onChange({ ...schedule, exitTime: e.target.value + ':00' })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                    Guardar Nuevo Horario
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}