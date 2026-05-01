import { useState } from 'react';
import { Input, Select, Textarea, Btn } from './UI';

const DEFAULT = { title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '' };

export default function TaskForm({ onSubmit, members = [], initial = {} }) {
  const [form, setForm] = useState({ ...DEFAULT, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && <div className="error-msg">{error}</div>}

      <Input label="Title *" value={form.title} onChange={set('title')} placeholder="Task title" />
      <Textarea label="Description" value={form.description} onChange={set('description')} placeholder="Optional description" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Status" value={form.status} onChange={set('status')}>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </Select>
        <Select label="Priority" value={form.priority} onChange={set('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>

      <Select label="Assign to" value={form.assignedTo} onChange={set('assignedTo')}>
        <option value="">Unassigned</option>
        {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
      </Select>

      <Input label="Due date" type="date" value={form.dueDate} onChange={set('dueDate')} />

      <Btn type="submit" loading={loading} style={{ alignSelf: 'flex-end' }}>
        {initial._id ? 'Update Task' : 'Create Task'}
      </Btn>
    </form>
  );
}