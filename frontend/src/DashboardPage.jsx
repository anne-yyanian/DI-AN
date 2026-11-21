import { useEffect, useState } from 'react';
import { apiRequest } from './api';

export default function DashboardPage({ onLogout }) {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // State Form sesuai schema Prisma backend (title, category, description, completed)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('KULIAH');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);

      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest(`/activities${query}`);
      setActivities(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [search, categoryFilter]);

  const resetForm = () => {
    setTitle('');
    setCategory('KULIAH');
    setDescription('');
    setCompleted(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title,
      category,
      description,
      completed,
    };

    try {
      if (editingId) {
        await apiRequest(`/activities/${editingId}`, 'PATCH', payload);
      } else {
        await apiRequest('/activities', 'POST', payload);
      }
      resetForm();
      fetchActivities();
    } catch (err) {
      setError(Array.isArray(err.message) ? err.message.join(', ') : err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setCategory(item.category || 'KULIAH');
    setDescription(item.description || '');
    setCompleted(Boolean(item.completed));
  };

  const handleToggleComplete = async (item) => {
    try {
      await apiRequest(`/activities/${item.id}`, 'PATCH', {
        completed: !item.completed,
      });
      fetchActivities();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus aktivitas belajar ini?')) return;
    try {
      await apiRequest(`/activities/${id}`, 'DELETE');
      fetchActivities();
    } catch (err) {
      setError(err.message);
    }
  };

  const completedCount = activities.filter((item) => item.completed).length;

  return (
    <div className="dashboard">
      <header className="topbar">
        <h1>Student Activity Tracker</h1>
        <button onClick={onLogout} className="btn-danger">
          Logout
        </button>
      </header>

      {error && <div className="error-box">{error}</div>}

      {/* Kartu Ringkasan Statistik */}
      <div className="stats-grid">
        <div className="card stat-card">
          <span>Total Kegiatan</span>
          <strong>{activities.length}</strong>
        </div>
        <div className="card stat-card">
          <span>Kegiatan Selesai</span>
          <strong>
            {completedCount} / {activities.length}
          </strong>
        </div>
      </div>

      {/* Form Tambah / Edit Kegiatan */}
      <div className="card form-section">
        <h3>{editingId ? 'Edit Kegiatan Belajar' : 'Tambah Kegiatan Baru'}</h3>
        <form onSubmit={handleSubmit} className="activity-form">
          <input
            type="text"
            placeholder="Judul kegiatan (misal: Workshop Backend & Frontend)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="KULIAH">Kuliah</option>
            <option value="CODING">Coding</option>
            <option value="ORGANISASI">Organisasi</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
          <input
            type="text"
            placeholder="Deskripsi / catatan kegiatan (opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Simpan' : '+ Tambah'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter & Pencarian */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Cari judul kegiatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          <option value="KULIAH">Kuliah</option>
          <option value="CODING">Coding</option>
          <option value="ORGANISASI">Organisasi</option>
          <option value="LAINNYA">Lainnya</option>
        </select>
      </div>

      {/* Daftar Kegiatan */}
      <div className="activity-list">
        {activities.length === 0 ? (
          <p className="empty-state">Belum ada aktivitas belajar yang tercatat.</p>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className={`card activity-item ${item.completed ? 'completed-item' : ''}`}
            >
              <div>
                <div className="badge-row">
                  <span className="badge">{item.category}</span>
                  <span className={`status-badge ${item.completed ? 'done' : 'pending'}`}>
                    {item.completed ? '✓ Selesai' : '⏳ Belum Selesai'}
                  </span>
                </div>
                <h4 className={item.completed ? 'strike' : ''}>{item.title}</h4>
                {item.description && <p className="notes">{item.description}</p>}
              </div>
              <div className="item-actions">
                <button
                  onClick={() => handleToggleComplete(item)}
                  className="btn-success"
                >
                  {item.completed ? 'Batal Selesai' : 'Tandai Selesai'}
                </button>
                <button onClick={() => handleEdit(item)} className="btn-secondary">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn-danger"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}