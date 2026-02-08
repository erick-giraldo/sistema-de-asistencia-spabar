import { Schedule } from '@/app/types'

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
    const getSortIcon = (field: keyof Schedule) => {
        if (sortField !== field) return null
        return sortDirection === 'asc' ? '↑' : '↓'
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            onClick={() => onSort('id')}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        >
                            <span className="flex items-center gap-1">
                                ID {getSortIcon('id')}
                            </span>
                        </th>
                        <th
                            onClick={() => onSort('name')}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        >
                            <span className="flex items-center gap-1">
                                Nombre {getSortIcon('name')}
                            </span>
                        </th>
                        <th
                            onClick={() => onSort('department')}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        >
                            <span className="flex items-center gap-1">
                                Departamento {getSortIcon('department')}
                            </span>
                        </th>
                        <th
                            onClick={() => onSort('entryTime')}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        >
                            <span className="flex items-center gap-1">
                                H. Entrada {getSortIcon('entryTime')}
                            </span>
                        </th>
                        <th
                            onClick={() => onSort('exitTime')}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        >
                            <span className="flex items-center gap-1">
                                H. Salida {getSortIcon('exitTime')}
                            </span>
                        </th>
                        <th
                            onClick={() => onSort('scheduledHours')}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        >
                            <span className="flex items-center gap-1">
                                Hrs Prog. {getSortIcon('scheduledHours')}
                            </span>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                                No hay horarios registrados
                            </td>
                        </tr>
                    ) : (
                        schedules.map((schedule) => (
                            <tr key={schedule.id} className="hover:bg-gray-50">
                                {editingId === schedule.id ? (
                                    <>
                                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                            {schedule.id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={editForm.name || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                                                className="w-full min-w-[150px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={editForm.department || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, department: e.target.value })}
                                                className="w-full min-w-[120px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="time"
                                                step="1"
                                                value={editForm.entryTime?.substring(0, 5) || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, entryTime: e.target.value + ':00' })}
                                                className="w-full min-w-[100px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="time"
                                                step="1"
                                                value={editForm.exitTime?.substring(0, 5) || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, exitTime: e.target.value + ':00' })}
                                                className="w-full min-w-[100px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={editForm.scheduledHours || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, scheduledHours: parseInt(e.target.value) })}
                                                className="w-full min-w-[80px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={onSave}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={onCancel}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-gray-400 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 whitespace-nowrap"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                            {schedule.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                            {schedule.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {schedule.department}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {schedule.entryTime}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {schedule.exitTime}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {schedule.scheduledHours}h
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {permissions.canEdit && (
                                                    <button
                                                        onClick={() => onEdit(schedule)}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 whitespace-nowrap"
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                                {permissions.canDelete && (
                                                    <button
                                                        onClick={() => onDelete(schedule.id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 whitespace-nowrap"
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                                {!permissions.canEdit && !permissions.canDelete && (
                                                    <span className="text-xs text-gray-400 italic">Sin permisos</span>
                                                )}
                                            </div>
                                        </td>
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