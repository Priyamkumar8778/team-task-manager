import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi, taskApi, userApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { Btn, Modal, Select, Spinner, Error, EmptyState, Badge } from '../components/UI';
import './ProjectDetail.css';

const STATUS_COLS = ['todo', 'in-progress', 'done'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const { data: project, loading: pLoad, error: pErr, refetch: refetchProject } = useAsync(() => projectApi.get(id), [id]);
  const { data: tasks, loading: tLoad, refetch: refetchTasks } = useAsync(() => taskApi.list({ project: id }), [id]);
  const { data: allUsers } = useAsync(() => isAdmin ? userApi.list() : Promise.resolve([]), [isAdmin]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const refetch = () => { refetchTasks(); refetchProject(); };

  const handleCreateTask = async (data) => {
    await taskApi.create({ ...data, project: id });
    setShowTaskModal(false);
    refetchTasks();
  };

  const handleStatusChange = async (taskId, status) => {
    await taskApi.update(taskId, { status });
    refetchTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await taskApi.delete(taskId);
    refetchTasks();
  };

  const handleAddMember = async () => {
    if (!memberToAdd) return;
    await projectApi.addMember(id, memberToAdd);
    setShowMemberModal(false);
    setMemberToAdd('');
    refetchProject();
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    await projectApi.removeMember(id, userId);
    refetchProject();
  };

  if (pLoad || tLoad) return <Spinner />;
  if (pErr) return <Error message={pErr} />;
  if (!project) return <Error message="Project not found" />;

  const filtered = filterStatus ? tasks?.filter(t => t.status === filterStatus) : tasks;
  const nonMembers = allUsers?.filter(u => !project.members?.some(m => m._id === u._id)) || [];

  return (
    <div className="project-detail">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && <Btn variant="ghost" onClick={() => setShowMemberModal(true)}>Manage Members</Btn>}
          <Btn onClick={() => setShowTaskModal(true)}>+ Add Task</Btn>
        </div>
      </div>

      {/* Members */}
      <div className="members-row">
        {project.members?.map(m => (
          <div key={m._id} className="member-chip" title={m.email}>
            <span className="member-avatar">{m.name[0].toUpperCase()}</span>
            <span>{m.name}</span>
            {isAdmin && m._id !== project.owner._id && (
              <button className="remove-member" onClick={() => handleRemoveMember(m._id)}>✕</button>
            )}
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="task-filter">
        <span className="filter-label">Filter:</span>
        {['', ...STATUS_COLS].map(s => (
          <button
            key={s}
            className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s ? <Badge status={s} /> : 'All'}
          </button>
        ))}
      </div>

      {/* Task board (kanban columns) */}
      {!filterStatus ? (
        <div className="kanban-board">
          {STATUS_COLS.map(status => {
            const col = tasks?.filter(t => t.status === status) || [];
            return (
              <div key={status} className="kanban-col">
                <div className="kanban-header">
                  <Badge status={status} />
                  <span className="kanban-count">{col.length}</span>
                </div>
                <div className="kanban-tasks">
                  {col.length === 0
                    ? <div className="kanban-empty">No tasks</div>
                    : col.map(t => (
                      <TaskCard
                        key={t._id}
                        task={t}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="task-list">
          {!filtered?.length
            ? <EmptyState icon="◻" message="No tasks match the filter" />
            : filtered.map(t => (
              <TaskCard key={t._id} task={t} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
            ))
          }
        </div>
      )}

      {/* Task modal */}
      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <TaskForm onSubmit={handleCreateTask} members={project.members} />
      </Modal>

      {/* Member modal */}
      <Modal open={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <Select label="Select user" value={memberToAdd} onChange={e => setMemberToAdd(e.target.value)}>
          <option value="">Choose a user…</option>
          {nonMembers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
        </Select>
        <Btn onClick={handleAddMember} disabled={!memberToAdd} style={{ alignSelf: 'flex-end' }}>Add Member</Btn>
      </Modal>
    </div>
  );
}