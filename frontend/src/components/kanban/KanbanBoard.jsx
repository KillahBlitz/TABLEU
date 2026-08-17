import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { boardService } from '../../services/boardService';
import { epicService } from '../../services/epicService';
import { sprintService } from '../../services/sprintService';
import { authService } from '../../services/authService';
import { KanbanColumn } from './KanbanColumn';
import { StoryModal } from './StoryModal';
import { StoryFormModal } from '../backlog/StoryFormModal';
import { EpicManagerModal } from '../epics/EpicManagerModal';
import { SprintControlModal } from '../sprints/SprintControlModal';
import { UserManagerModal } from '../users/UserManagerModal';
import { Plus, Layers, Calendar, Users, AlertCircle, Play } from 'lucide-react';

export const KanbanBoard = () => {
  const { isAdmin } = useAuth();

  const [stories, setStories] = useState([]);
  const [epics, setEpics] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSprint, setActiveSprint] = useState(null);

  const [selectedEpicId, setSelectedEpicId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const [activeStory, setActiveStory] = useState(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [epicsData, sprintsData, usersData] = await Promise.all([
        epicService.getEpics(),
        sprintService.getSprints(),
        authService.getUsers()
      ]);

      setEpics(epicsData);
      setSprints(sprintsData);
      setUsers(usersData);

      const currentActive = sprintsData.find((s) => s.status === 'active');
      setActiveSprint(currentActive || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    if (!activeSprint) {
      setStories([]);
      return;
    }

    try {
      const params = { sprintId: activeSprint._id };
      if (selectedEpicId) params.epicId = selectedEpicId;
      if (selectedUserId) params.assignedTo = selectedUserId;

      const data = await boardService.getStories(params);
      setStories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadStories();
  }, [activeSprint, selectedEpicId, selectedUserId]);

  const handleMoveStory = async (storyId, newStatus) => {
    if (!activeSprint) return;

    try {
      setStories((prev) =>
        prev.map((s) => (s._id === storyId ? { ...s, status: newStatus } : s))
      );

      await boardService.updateStatus(storyId, newStatus);
      await boardService.updateStory(storyId, { sprintId: activeSprint._id });
      loadStories();
    } catch (error) {
      console.error(error);
      loadStories();
    }
  };

  const handleCardClick = (story) => {
    setActiveStory(story);
    setIsStoryModalOpen(true);
  };

  const columns = [
    {
      key: 'todo',
      title: 'ToDo',
      colClass: 'col-todo',
      stories: stories.filter((s) => s.status === 'todo' || s.status === 'backlog'),
      prevStatus: null,
      nextStatus: 'in_progress',
      prevLabel: '',
      nextLabel: 'Dev'
    },
    {
      key: 'in_progress',
      title: 'Development',
      colClass: 'col-dev',
      stories: stories.filter((s) => s.status === 'in_progress'),
      prevStatus: 'todo',
      nextStatus: 'to_be_tested',
      prevLabel: 'ToDo',
      nextLabel: 'Test'
    },
    {
      key: 'to_be_tested',
      title: 'To Be Tested',
      colClass: 'col-test',
      stories: stories.filter((s) => s.status === 'to_be_tested'),
      prevStatus: 'in_progress',
      nextStatus: 'ready_qa',
      prevLabel: 'Dev',
      nextLabel: 'QA'
    },
    {
      key: 'ready_qa',
      title: 'Ready QA',
      colClass: 'col-qa',
      stories: stories.filter((s) => s.status === 'ready_qa'),
      prevStatus: 'to_be_tested',
      nextStatus: null,
      prevLabel: 'Test',
      nextLabel: ''
    }
  ];

  return (
    <div className="kanban-view-container">
      <div className="board-header">
        <div className="board-title-group">
          <h1 className="board-title">Tablero Kanban</h1>
          {activeSprint ? (
            <span className="sprint-badge active">
              <Calendar size={13} />
              {activeSprint.name} (En Curso)
            </span>
          ) : (
            <span className="sprint-badge" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
              <AlertCircle size={13} />
              Sin Sprint Activo
            </span>
          )}
        </div>

        <div className="board-controls">
          {activeSprint && (
            <>
              <select
                className="filter-select"
                value={selectedEpicId}
                onChange={(e) => setSelectedEpicId(e.target.value)}
              >
                <option value="">Todas las Épicas</option>
                {epics.map((ep) => (
                  <option key={ep._id} value={ep._id}>
                    {ep.title}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Todos los Miembros</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {isAdmin && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsUserModalOpen(true)}
              >
                <Users size={14} />
                Equipo
              </button>

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

              {activeSprint && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsNewStoryModalOpen(true)}
                >
                  <Plus size={14} />
                  Nueva Historia
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {!activeSprint ? (
        <div
          style={{
            background: 'var(--bg-columns)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '60px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '680px',
            margin: '40px auto'
          }}
        >
          <Calendar size={48} color="var(--accent-todo)" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>No hay ningún Sprint activo actualmente</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '480px' }}>
            El tablero Kanban se habilita únicamente cuando un Sprint está en curso. Al finalizar un Sprint, las tareas no completadas vuelven al Backlog y el tablero se pausa hasta iniciar el siguiente ciclo.
          </p>

          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => setIsSprintModalOpen(true)}
              style={{ marginTop: '8px' }}
            >
              <Play size={16} />
              <span>Gestionar e Iniciar Sprint</span>
            </button>
          )}
        </div>
      ) : (
        <div className="kanban-grid">
          {columns.map((col) => (
            <KanbanColumn
              key={col.key}
              statusKey={col.key}
              title={col.title}
              colClass={col.colClass}
              stories={col.stories}
              onCardClick={handleCardClick}
              onDropStory={handleMoveStory}
              onMoveStatus={handleMoveStory}
              prevStatus={col.prevStatus}
              nextStatus={col.nextStatus}
              prevLabel={col.prevLabel}
              nextLabel={col.nextLabel}
            />
          ))}
        </div>
      )}

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
        onStoryUpdated={loadStories}
        onStoryDeleted={loadStories}
      />

      <StoryFormModal
        isOpen={isNewStoryModalOpen}
        epics={epics}
        sprints={sprints}
        users={users}
        defaultSprintId={activeSprint?._id || ''}
        onClose={() => setIsNewStoryModalOpen(false)}
        onStoryCreated={loadStories}
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

      <UserManagerModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onUsersUpdated={() => {
          loadData();
          loadStories();
        }}
      />
    </div>
  );
};
