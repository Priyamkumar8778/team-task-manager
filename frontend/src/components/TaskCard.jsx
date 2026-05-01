import { Badge, PriorityBadge, formatDate, isOverdue } from './UI';
import './TaskCard.css';

export default function TaskCard({ task, onStatusChange, onDelete, showProject }) {
  const overdue = isOverdue(task);

  const cycleStatus = () => {
    const order = ['todo', 'in-progress', 'done'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    onStatusChange?.(task._id, next);
  };

  return (
    <div className={`task-card ${overdue ? 'overdue' : ''}`}>
      <div className="task-top">
        <button className="task-status-btn" onClick={cycleStatus} title="Click to advance status">
          <Badge status={task.status} />
        </button>
        <PriorityBadge priority={task.priority} />
        {overdue && <span className="overdue-tag">⚠ Overdue</span>}
      </div>

      <h4 className="task-title">{task.title}</h4>
      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        {showProject && task.project && (
          <span className="meta-item">◫ {task.project.name}</span>
        )}
        {task.assignedTo && (
          <span className="meta-item">◯ {task.assignedTo.name}</span>
        )}
        {task.dueDate && (
          <span className={`meta-item ${overdue ? 'meta-danger' : ''}`}>
            ◷ {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {onDelete && (
        <button className="task-delete" onClick={() => onDelete(task._id)} title="Delete task">✕</button>
      )}
    </div>
  );
}