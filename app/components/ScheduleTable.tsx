import { Schedule } from '@/app/types'
import DayTrack, { DAY_TRACK_HOURS } from '@/components/ui/DayTrack'

type ScheduleTableProps = {
    schedules: Schedule[]
    editingId: number | null
    editForm: Partial<Schedule>
    permissions: {
        canEdit: boolean
        canDelete: boolean
    }
    onEdit: (schedule: Schedule) => void
    onSave: () => void
    onCancel: () => void
    onDelete: (id: number) => void
    onEditFormChange: (form: Partial<Schedule>) => void
    sortField: keyof Schedule
    sortDirection: 'asc' | 'desc'
    onSort: (field: keyof Schedule) => void
}

const compactField = 'field min-h-10 text-sm'

export default function ScheduleTable({
    schedules,
    editingId,
    editForm,
    permissions,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onEditFormChange,
    sortField,
    sortDirection,
    onSort
}: ScheduleTableProps) {
    const hasActions = permissions.canEdit || permissions.canDelete

    const sortableHeader = (field: keyof Schedule, label: string) => (
        <th
            scope="col"
            className="data-th"
            aria-sort={sortField === field ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            <button
                type="button"
                onClick={() => onSort(field)}
                className="inline-flex min-h-6 items-center gap-1 transition-colors hover:text-spa-text"
            >
                {label}
                {sortField === field && <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
            </button>
        </th>
    )

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-[15px]">
                <thead>
                    <tr>
                        {sortableHeader('id', 'ID')}
                        {sortableHeader('name', 'Nombre')}
                        {sortableHeader('department', 'Departamento')}
                        <th scope="col" className="data-th w-[32%]">
                            <span className="sr-only">Jornada</span>
                            <span aria-hidden="true" className="flex justify-between font-mono">
                                {DAY_TRACK_HOURS.map((hour) => <span key={hour}>{hour}</span>)}
                            </span>
                        </th>
                        {sortableHeader('entryTime', 'Entrada')}
                        {sortableHeader('exitTime', 'Salida')}
                        {sortableHeader('scheduledHours', 'Horas')}
                        {hasActions && <th scope="col" className="data-th text-right">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {schedules.length === 0 ? (
                        <tr>
                            <td colSpan={hasActions ? 8 : 7} className="py-12 text-center text-[15px] text-spa-muted">
                                No hay horarios registrados
                            </td>
                        </tr>
                    ) : (
                        schedules.map((schedule) => (
                            <tr key={schedule.id} className="data-row">
                                {editingId === schedule.id ? (
                                    <>
                                        <td className="data-td data-num text-spa-muted">{schedule.id}</td>
                                        <td className="data-td">
                                            <input
                                                type="text"
                                                aria-label="Nombre"
                                                value={editForm.name || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                                                className={`${compactField} min-w-[140px]`}
                                            />
                                        </td>
                                        <td className="data-td">
                                            <input
                                                type="text"
                                                aria-label="Departamento"
                                                value={editForm.department || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, department: e.target.value })}
                                                className={`${compactField} min-w-[110px]`}
                                            />
                                        </td>
                                        <td className="data-td">
                                            <DayTrack start={editForm.entryTime} end={editForm.exitTime} />
                                        </td>
                                        <td className="data-td">
                                            <input
                                                type="time"
                                                aria-label="Hora de entrada"
                                                step="1"
                                                value={editForm.entryTime?.substring(0, 5) || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, entryTime: e.target.value + ':00' })}
                                                className={`${compactField} min-w-[100px] font-mono`}
                                            />
                                        </td>
                                        <td className="data-td">
                                            <input
                                                type="time"
                                                aria-label="Hora de salida"
                                                step="1"
                                                value={editForm.exitTime?.substring(0, 5) || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, exitTime: e.target.value + ':00' })}
                                                className={`${compactField} min-w-[100px] font-mono`}
                                            />
                                        </td>
                                        <td className="data-td">
                                            <input
                                                type="number"
                                                aria-label="Horas programadas"
                                                value={editForm.scheduledHours || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, scheduledHours: parseInt(e.target.value) })}
                                                className={`${compactField} min-w-[56px] font-mono`}
                                            />
                                        </td>
                                        <td className="data-td">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={onSave} className="btn-solid px-4">Guardar</button>
                                                <button onClick={onCancel} className="btn-ghost px-4">Cancelar</button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="data-td data-num text-spa-muted">{schedule.id}</td>
                                        <td className="data-td">{schedule.name}</td>
                                        <td className="data-td text-sm text-spa-muted">{schedule.department}</td>
                                        <td className="data-td">
                                            <DayTrack start={schedule.entryTime} end={schedule.exitTime} />
                                        </td>
                                        <td className="data-td data-num">{schedule.entryTime?.substring(0, 5)}</td>
                                        <td className="data-td data-num">{schedule.exitTime?.substring(0, 5)}</td>
                                        <td className="data-td data-num">{schedule.scheduledHours}</td>
                                        {hasActions && (
                                            <td className="data-td py-1">
                                                <div className="flex justify-end gap-1">
                                                    {permissions.canEdit && (
                                                        <button
                                                            onClick={() => onEdit(schedule)}
                                                            aria-label={`Editar horario de ${schedule.name}`}
                                                            className="icon-btn"
                                                        >
                                                            <EditIcon />
                                                        </button>
                                                    )}
                                                    {permissions.canDelete && (
                                                        <button
                                                            onClick={() => onDelete(schedule.id)}
                                                            aria-label={`Eliminar horario de ${schedule.name}`}
                                                            className="icon-btn"
                                                        >
                                                            <DeleteIcon />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export function EditIcon() {
    return (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 2.5l3 3L5.5 13.5l-3.5.5.5-3.5z" />
        </svg>
    )
}

export function DeleteIcon() {
    return (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" />
        </svg>
    )
}
