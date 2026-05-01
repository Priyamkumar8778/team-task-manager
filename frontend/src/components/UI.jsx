import './UI.css';

export function Btn({ children, variant = 'primary', size = 'md', loading, ...props }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : children}
    </button>
  );
}

export function Badge({ status }) {
  const map = {
    todo: { label: 'Todo', cls: 'badge-todo' },
    'in-progress': { label: 'In Progress', cls: 'badge-inprogress' },
    done: { label: 'Done', cls: 'badge-done' },
  };
  const { label, cls } = map[status] || { label: status, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function PriorityBadge({ priority }) {
  const map = { low: 'p-low', medium: 'p-med', high: 'p-high' };
  return <span className={`priority ${map[priority]}`}>{priority}</span>;
}

export function Card({ children, className = '', ...props }) {
  return <div className={`card ${className}`} {...props}>{children}</div>;
}

export function Input({ label, error, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <input className={`field-input ${error ? 'field-error' : ''}`} {...props} />
      {error && <span className="field-hint">{error}</span>}
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <select className="field-input" {...props}>{children}</select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <textarea className="field-input" rows={3} {...props} />
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <span>{message}</span>
    </div>
  );
}

export function Spinner() {
  return <div className="spinner" />;
}

export function Error({ message }) {
  return <div className="error-msg">{message}</div>;
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isOverdue(task) {
  return task.dueDate && task.status !== 'done' && new Date() > new Date(task.dueDate);
}