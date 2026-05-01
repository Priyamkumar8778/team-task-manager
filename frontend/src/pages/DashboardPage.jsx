import { useAuth } from '../context/AuthContext';
import { taskApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import TaskCard from '../components/TaskCard';
import { Spinner, Error, EmptyState } from '../components/UI';
import './Dashboard.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAsync(() => taskApi.dashboard());

  const handleStatusChange = async (id, status) => {
    await taskApi.update(id, { status });
    refetch();
  };

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  const { statusCounts = {}, myTasks = [], overdue = [] } = data || {};
  const total = (statusCounts.todo || 0) + (statusCounts['in-progress'] || 0) + (statusCounts.done || 0);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard label="Total Tasks" value={total} icon="◻" color="var(--text)" />
        <StatCard label="Todo" value={statusCounts.todo || 0} icon="○" color="var(--todo)" />
        <StatCard label="In Progress" value={statusCounts['in-progress'] || 0} icon="◑" color="var(--inprogress)" />
        <StatCard label="Done" value={statusCounts.done || 0} icon="●" color="var(--done)" />
      </div>

      <div className="dash-grid">
        {/* Overdue */}
        <section>
          <h2 className="section-title">
            <span className="overdue-dot" />
            Overdue Tasks
            {overdue.length > 0 && <span className="count-badge danger">{overdue.length}</span>}
          </h2>
          {overdue.length === 0
            ? <EmptyState icon="✓" message="No overdue tasks" />
            : overdue.map(t => (
              <TaskCard key={t._id} task={t} onStatusChange={handleStatusChange} showProject />
            ))
          }
        </section>

        {/* My tasks */}
        <section>
          <h2 className="section-title">
            My Tasks
            {myTasks.length > 0 && <span className="count-badge">{myTasks.length}</span>}
          </h2>
          {myTasks.length === 0
            ? <EmptyState icon="◻" message="No tasks assigned to you" />
            : myTasks.map(t => (
              <TaskCard key={t._id} task={t} onStatusChange={handleStatusChange} showProject />
            ))
          }
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}