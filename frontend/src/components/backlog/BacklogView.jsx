import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { boardService } from '../../services/boardService';
import { epicService } from '../../services/epicService';
import { sprintService } from '../../services/sprintService';
import { authService } from '../../services/authService';
import { StoryModal } from '../kanban/StoryModal';
import { StoryFormModal } from './StoryFormModal';
import { EpicManagerModal } from '../epics/EpicManagerModal';
import { SprintControlModal } from '../sprints/SprintControlModal';
import { CategoryBadge, CATEGORY_OPTIONS } from '../common/CategoryConfig';
import { Plus, ListTodo, Layers, Calendar, Clock, Flame, AlertOctagon, Paperclip } from 'lucide-react';

export const BacklogView = () => {
  const { isAdmin } = useAuth();

  const [stories, setStories] = useState([]);
  const [epics, setEpics] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSprintFilter, setSelectedSprintFilter] = useState('all');
  const [selectedEpicFilter, setSelectedEpicFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  const [activeStory, setActiveStory] = useState(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [epicsData, sprintsData, usersData, storiesData] = await Promise.all([
        epicService.getEpics(),
        sprintService.getSprints(),
        authService.getUsers(),
        boardService.getStories()
      ]);

      setEpics(epicsData);
      setSprints(sprintsData);
      setUsers(usersData);
      setStories(storiesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStories = stories.filter((story) => {
    if (selectedSprintFilter === 'backlog_only') {
      if (story.sprintId) return false;
    } else if (selectedSprintFilter !== 'all') {
      if (story.sprintId?._id !== selectedSprintFilter) return false;
    }

    if (selectedEpicFilter && story.epicId?._id !== selectedEpicFilter) {
      return false;
    }

    if (selectedCategoryFilter && story.category !== selectedCategoryFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="backlog-view">
      <div className="board-header">
        <div className="board-title-group">
          <h1 className="board-title">Product Backlog</h1>
          <span className="sprint-badge">
            <ListTodo size={13} />
            {filteredStories.length} Historias
          </span>
        </div>

        <div className="board-controls">
          <select
            className="filter-select"
            value={selectedSprintFilter}
            onChange={(e) => setSelectedSprintFilter(e.target.value)}
          >
            <option value="all">Todos los Sprints / Backlog</option>
            <option value="backlog_only">Solo Backlog (Sin Sprint)</option>
            {sprints.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedEpicFilter}
            onChange={(e) => setSelectedEpicFilter(e.target.value)}
          >
            <option value="">Todas las Épicas (Categorías)</option>
            {epics.map((ep) => (
              <option key={ep._id} value={ep._id}>
                {ep.title}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {isAdmin && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEpicModalOpen(true)}
              >
                <Layers size={14} />
                Épicas
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsSprintModalOpen(true)}
              >
                <Calendar size={14} />
                Sprints
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsNewStoryModalOpen(true)}
              >
                <Plus size={14} />
                Crear Historia
              </button>
            </>
          )}
        </div>
      </div>

      <div className="backlog-section">
        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: '20px' }}>Cargando backlog...</p>
        ) : filteredStories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            No hay historias de usuario con los filtros seleccionados.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="backlog-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Historia</th>
                  <th>Épica (Categoría)</th>
                  <th>Sprint</th>
                  <th>Asignado</th>
                  <th>Puntos</th>
                  <th>Horas</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredStories.map((story) => (
                  <tr
                    key={story._id}
                    onClick={() => {
                      setActiveStory(story);
                      setIsStoryModalOpen(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <CategoryBadge category={story.category} size={14} showLabel={true} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {story.isBlocked && (
                          <AlertOctagon size={16} color="var(--accent-blocked)" title={story.blockedReason} />
                        )}
                        <span style={{ fontWeight: 600 }}>{story.title}</span>
                        {(story.attachments?.length || 0) > 0 && (
                          <span className="attach-badge" title={`${story.attachments.length} adjunto(s)`}>
                            <Paperclip size={11} />
                            {story.attachments.length}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {story.epicId ? (
                        <span
                          className="epic-pill"
                          style={{
                            backgroundColor: `${story.epicId.color || '#00E5FF'}22`,
                            color: story.epicId.color || '#00E5FF',
                            border: `1px solid ${story.epicId.color || '#00E5FF'}44`
                          }}
                        >
                          {story.epicId.title}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      {story.sprintId ? (
                        <span style={{ fontSize: '0.82rem', color: 'var(--accent-todo)' }}>
                          {story.sprintId.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Backlog</span>
                      )}
                    </td>
                    <td>
                      {story.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div
                            className="assignee-avatar"
                            style={{
                              backgroundColor: story.assignedTo.avatarColor || '#00E5FF',
                              width: '20px',
                              height: '20px',
                              fontSize: '0.65rem'
                            }}
                          >
                            {story.assignedTo.name[0]}
                          </div>
                          <span style={{ fontSize: '0.82rem' }}>{story.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Sin asignar</span>
                      )}
                    </td>
                    <td>
                      <span className="diff-badge">
                        <Flame size={12} color="var(--accent-in-progress)" />
                        {story.difficulty || 1}
                      </span>
                    </td>
                    <td>
                      <span className="hours-badge">
                        <Clock size={12} />
                        {story.loggedHours || 0}/{story.estimatedHours || 0}h
                      </span>
                    </td>
                    <td>
                      <span className={`priority-pill priority-${story.priority || 'medium'}`}>
                        {story.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag status-${story.status}`}>
                        {story.status === 'ready_qa'
                          ? 'Ready QA'
                          : story.status === 'in_progress'
                          ? 'Development'
                          : story.status === 'to_be_tested'
                          ? 'To Test'
                          : story.status === 'todo'
                          ? 'ToDo'
                          : 'Backlog'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StoryModal
        isOpen={isStoryModalOpen}
        story={activeStory}
        epics={epics}
        sprints={sprints}
        users={users}
        onClose={() => {
          setIsStoryModalOpen(false);
          setActiveStory(null);
        }}
        onStoryUpdated={loadData}
        onStoryDeleted={loadData}
      />

      <StoryFormModal
        isOpen={isNewStoryModalOpen}
        epics={epics}
        sprints={sprints}
        users={users}
        onClose={() => setIsNewStoryModalOpen(false)}
        onStoryCreated={loadData}
      />

      <EpicManagerModal
        isOpen={isEpicModalOpen}
        onClose={() => setIsEpicModalOpen(false)}
        onEpicsUpdated={loadData}
      />

      <SprintControlModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        onSprintsUpdated={loadData}
      />
    </div>
  );
};
