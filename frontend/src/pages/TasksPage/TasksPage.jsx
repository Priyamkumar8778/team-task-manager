import { useState } from 'react';
import { taskApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { Spinner, Error, EmptyState, Badge } from '../components/UI';
import './Tasks.css';

const STATUSES = ['todo', 'in-progress', 'done'];

export default function TasksPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState({ status: '', assignedTo: '' });

  const params = {};
  if (filter.status) params.status = filter.status;
  if (filter.assignedTo) params.assignedTo = user._id;

  const { data: tasks, loading, error, refetch } = useAsync(
    () => taskApi.list(params),
    [filter.status, filter.assignedTo]
  );

  const handleStatusChange = async (id, status) => {
    await taskApi.update(id, { status });
    refetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await taskApi.delete(id);
    refetch();
  };

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Tasks</h1>
          <p className="page-subtitle">{tasks?.length || 0} tasks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="task-filter-bar">
        <div className="filter-group">
          <span className="filter-lbl">Status</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`filter-pill ${!filter.status ? 'active' : ''}`}
              onClick={() => setFilter(f => ({ ...f, status: '' }))}
            >All</button>
            {STATUSES.map(s => (
              <button
                key={s}
                className={`filter-pill ${filter.status === s ? 'active' : ''}`}
                onClick={() => setFilter(f => ({ ...f, status: s }))}
              >
                <Badge status={s} />
              </button>
            ))}
          </div>
        </div>

        <label className="filter-pill" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!filter.assignedTo}
            onChange={e => setFilter(f => ({ ...f, assignedTo: e.target.checked ? user._id : '' }))}
            style={{ marginRight: 6 }}
          />
          My tasks only
        </label>
      </div>

      {/* Task list */}
      {!tasks?.length
        ? <EmptyState icon="◻" message="No tasks found" />
        : (
          <div className="tasks-list">
            {tasks.map(t => (
              <TaskCard
                key={t._id}
                task={t}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                showProject
              />
            ))}
          </div>
        )
      }
    </div>
  );
}