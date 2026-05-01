import { useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { Btn, Modal, Input, Textarea, Spinner, Error, EmptyState } from '../components/UI';
import './Projects.css';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { data: projects, loading, error, refetch } = useAsync(() => projectApi.list());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Name required');
    setFormError('');
    setCreating(true);
    try {
      await projectApi.create(form);
      setShowModal(false);
      setForm({ name: '', description: '' });
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    await projectApi.delete(id);
    refetch();
  };

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects?.length || 0} projects</p>
        </div>
        {user.role === 'admin' && (
          <Btn onClick={() => setShowModal(true)}>+ New Project</Btn>
        )}
      </div>

      {!projects?.length
        ? <EmptyState icon="◫" message="No projects yet" />
        : (
          <div className="project-grid">
            {projects.map(p => (
              <ProjectCard key={p._id} project={p} isAdmin={user.role === 'admin'} onDelete={handleDelete} />
            ))}
          </div>
        )
      }

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Project">
        <form onSubmit={handleCreate} style={{ display: 'contents' }}>
          {formError && <div className="error-msg">{formError}</div>}
          <Input label="Project name *" value={form.name} onChange={set('name')} placeholder="My awesome project" />
          <Textarea label="Description" value={form.description} onChange={set('description')} placeholder="What's this project about?" />
          <Btn type="submit" loading={creating} style={{ alignSelf: 'flex-end' }}>Create</Btn>
        </form>
      </Modal>
    </div>
  );
}

function ProjectCard({ project, isAdmin, onDelete }) {
  return (
    <div className="project-card">
      <div className="project-card-top">
        <Link to={`/projects/${project._id}`} className="project-name">{project.name}</Link>
        {isAdmin && (
          <button className="project-del-btn" onClick={() => onDelete(project._id)} title="Delete">✕</button>
        )}
      </div>

      {project.description && <p className="project-desc">{project.description}</p>}

      <div className="project-meta">
        <span className="meta-chip">◯ {project.owner?.name}</span>
        <span className="meta-chip">👥 {project.members?.length} members</span>
      </div>

      <Link to={`/projects/${project._id}`} className="project-link-btn">View Project →</Link>
    </div>
  );
}