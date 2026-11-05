import { Schedule } from '@/app/types'

type AddScheduleFormProps = {
    schedule: Partial<Schedule>
    onChange: (schedule: Partial<Schedule>) => void
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
}

export default function AddScheduleForm({ schedule, onChange, onSubmit, onCancel }: AddScheduleFormProps) {
    return (
        <form onSubmit={onSubmit} aria-label="Nuevo horario" className="panel mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                    <label htmlFor="horario-nombre" className="field-label">Nombre</label>
                    <input
                        id="horario-nombre"
                        type="text"
                        value={schedule.name || ''}
                        onChange={(e) => onChange({ ...schedule, name: e.target.value })}
                        className="field"
                        placeholder="Nombre del empleado"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="horario-departamento" className="field-label">Departamento</label>
                    <input
                        id="horario-departamento"
                        type="text"
                        value={schedule.department || ''}
                        onChange={(e) => onChange({ ...schedule, department: e.target.value })}
                        className="field"
                        placeholder="Ej: Spabar"
                    />
                </div>

                <div>
                    <label htmlFor="horario-entrada" className="field-label">Entrada</label>
                    <input
                        id="horario-entrada"
                        type="time"
                        step="1"
                        value={schedule.entryTime?.substring(0, 5) || ''}
                        onChange={(e) => onChange({ ...schedule, entryTime: e.target.value + ':00' })}
                        className="field font-mono"
                    />
                </div>

                <div>
                    <label htmlFor="horario-salida" className="field-label">Salida</label>
                    <input
                        id="horario-salida"
                        type="time"
                        step="1"
                        value={schedule.exitTime?.substring(0, 5) || ''}
                        onChange={(e) => onChange({ ...schedule, exitTime: e.target.value + ':00' })}
                        className="field font-mono"
                    />
                </div>

                <div>
                    <label htmlFor="horario-horas" className="field-label">Horas programadas</label>
                    <input
                        id="horario-horas"
                        type="number"
                        value={schedule.scheduledHours || ''}
                        onChange={(e) => onChange({ ...schedule, scheduledHours: parseInt(e.target.value) || 0 })}
                        className="field font-mono"
                        placeholder="9"
                        min="0"
                        step="0.5"
                    />
                </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
                <button type="submit" className="btn-solid">Guardar horario</button>
                <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
            </div>
        </form>
    )
}
