import type { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  VALIDATING: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  SCHEDULED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
  ACQUIRING: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  PROCESSING: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
  COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
  FAILED: 'bg-red-500/20 text-red-300 border-red-500/50',
  CANCELLED: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
};

export const TaskList = ({ tasks }: TaskListProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-700">
        <div className="text-4xl mb-4">🛰️</div>
        <div className="text-slate-300 font-medium">No missions submitted</div>
        <div className="text-sm text-slate-500 mt-2">
          Draw an AOI and submit your first tasking request
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Mission Queue ({tasks.length})</h3>

      <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all shadow-lg"
          >
            {/* Status Badge */}
            <div
              className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border mb-3 ${
                statusColors[task.status]
              }`}
            >
              {task.status}
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide">Mode</div>
                <div className="font-medium text-white">{task.resolution}</div>
              </div>

              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide">Area</div>
                <div className="font-medium text-white">{task.aoi.area} km²</div>
              </div>

              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide">Priority</div>
                <div className="font-medium text-white capitalize">{task.priority.toLowerCase()}</div>
              </div>

              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide">Polarization</div>
                <div className="font-medium text-white">{task.polarization}</div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
              Submitted: {formatDate(task.createdAt)}
            </div>

            {/* Validation Errors */}
            {task.validationErrors && task.validationErrors.length > 0 && (
              <div className="mt-2 p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg text-xs">
                <div className="font-semibold text-amber-300 mb-1">⚠ Warnings:</div>
                {task.validationErrors.map((error, idx) => (
                  <div key={idx} className="text-amber-200">
                    • {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
