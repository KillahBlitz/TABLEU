import Story from '../models/Story.js';
import User from '../models/User.js';
import Epic from '../models/Epic.js';
import Sprint from '../models/Sprint.js';

export const getKpiSummary = async (req, res) => {
  try {
    const stories = await Story.find();

    const totalStories = stories.length;
    const completedStories = stories.filter((s) => s.status === 'ready_qa').length;
    const blockedStoriesCount = stories.filter((s) => s.isBlocked).length;

    const totalEstimatedHours = stories.reduce((acc, s) => acc + (s.estimatedHours || 0), 0);
    const totalLoggedHours = stories.reduce((acc, s) => acc + (s.loggedHours || 0), 0);

    const hoursProgressPercentage =
      totalEstimatedHours > 0
        ? Number(((totalLoggedHours / totalEstimatedHours) * 100).toFixed(2))
        : totalStories > 0
        ? Number(((completedStories / totalStories) * 100).toFixed(2))
        : 0;

    const totalPoints = stories.reduce((acc, s) => acc + (s.difficulty || 0), 0);
    const completedPoints = stories
      .filter((s) => s.status === 'ready_qa')
      .reduce((acc, s) => acc + (s.difficulty || 0), 0);

    const pointsProgressPercentage =
      totalPoints > 0
        ? Number(((completedPoints / totalPoints) * 100).toFixed(2))
        : 0;

    const columnDistribution = {
      backlog: stories.filter((s) => s.status === 'backlog').length,
      todo: stories.filter((s) => s.status === 'todo').length,
      in_progress: stories.filter((s) => s.status === 'in_progress').length,
      to_be_tested: stories.filter((s) => s.status === 'to_be_tested').length,
      ready_qa: completedStories
    };

    return res.json({
      totalStories,
      completedStories,
      totalEstimatedHours,
      totalLoggedHours,
      hoursProgressPercentage,
      totalPoints,
      completedPoints,
      pointsProgressPercentage,
      blockedStoriesCount,
      columnDistribution
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getKpisByUser = async (req, res) => {
  try {
    const { sprintId } = req.query;
    const users = await User.find().select('-password').sort({ name: 1 });
    const storyFilter = {};
    if (sprintId) storyFilter.sprintId = sprintId;
    const allStories = await Story.find(storyFilter);

    const userKpis = users.map((user) => {
      const userStories = allStories.filter(
        (s) => s.assignedTo && s.assignedTo.toString() === user._id.toString()
      );

      const totalAssigned = userStories.length;
      const completed = userStories.filter((s) => s.status === 'ready_qa').length;
      const inProgress = userStories.filter((s) => ['in_progress', 'to_be_tested'].includes(s.status)).length;
      const todo = userStories.filter((s) => s.status === 'todo').length;
      const blockedCount = userStories.filter((s) => s.isBlocked).length;

      const estimatedHours = userStories.reduce((acc, s) => acc + (s.estimatedHours || 0), 0);
      const loggedHours = userStories.reduce((acc, s) => acc + (s.loggedHours || 0), 0);

      const hoursProgress =
        estimatedHours > 0
          ? Number(((loggedHours / estimatedHours) * 100).toFixed(2))
          : totalAssigned > 0
          ? Number(((completed / totalAssigned) * 100).toFixed(2))
          : 0;

      const hoursDeviation = Number((loggedHours - estimatedHours).toFixed(2));

      const totalPoints = userStories.reduce((acc, s) => acc + (s.difficulty || 0), 0);
      const completedPoints = userStories
        .filter((s) => s.status === 'ready_qa')
        .reduce((acc, s) => acc + (s.difficulty || 0), 0);

      const pointsProgress =
        totalPoints > 0
          ? Number(((completedPoints / totalPoints) * 100).toFixed(2))
          : 0;

      const categoryBreakdown = {
        tarea: userStories.filter((s) => s.category === 'tarea').length,
        historia: userStories.filter((s) => s.category === 'historia').length,
        hito: userStories.filter((s) => s.category === 'hito').length,
        bug: userStories.filter((s) => s.category === 'bug').length,
        mejora: userStories.filter((s) => s.category === 'mejora').length
      };

      const uncategorized = userStories.filter((s) => !s.category).length;
      if (uncategorized > 0) {
        categoryBreakdown.tarea += uncategorized;
      }

      return {
        userId: user._id,
        userName: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        role: user.role,
        jobRole: user.jobRole || 'devRH',
        totalAssigned,
        completed,
        inProgress,
        todo,
        blockedCount,
        estimatedHours,
        loggedHours,
        hoursProgress,
        hoursDeviation,
        totalPoints,
        completedPoints,
        pointsProgress,
        categoryBreakdown
      };
    });

    return res.json(userKpis);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getKpisByEpic = async (req, res) => {
  try {
    const { sprintId } = req.query;
    const epics = await Epic.find().sort({ title: 1 });
    const storyFilter = {};
    if (sprintId) storyFilter.sprintId = sprintId;
    const allStories = await Story.find(storyFilter);

    const epicKpis = epics.map((epic) => {
      const epicStories = allStories.filter(
        (s) => s.epicId && s.epicId.toString() === epic._id.toString()
      );

      const totalStories = epicStories.length;
      const completedStories = epicStories.filter((s) => s.status === 'ready_qa').length;
      const estimatedHours = epicStories.reduce((acc, s) => acc + (s.estimatedHours || 0), 0);
      const loggedHours = epicStories.reduce((acc, s) => acc + (s.loggedHours || 0), 0);

      const hoursProgress =
        estimatedHours > 0
          ? Number(((loggedHours / estimatedHours) * 100).toFixed(2))
          : totalStories > 0
          ? Number(((completedStories / totalStories) * 100).toFixed(2))
          : 0;

      const totalPoints = epicStories.reduce((acc, s) => acc + (s.difficulty || 0), 0);
      const completedPoints = epicStories
        .filter((s) => s.status === 'ready_qa')
        .reduce((acc, s) => acc + (s.difficulty || 0), 0);

      const pointsProgress =
        totalPoints > 0
          ? Number(((completedPoints / totalPoints) * 100).toFixed(2))
          : 0;

      return {
        epicId: epic._id,
        title: epic.title,
        color: epic.color,
        status: epic.status,
        totalStories,
        completedStories,
        estimatedHours,
        loggedHours,
        hoursProgress,
        totalPoints,
        completedPoints,
        pointsProgress
      };
    });

    return res.json(epicKpis);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getKpiBySprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    const stories = await Story.find({ sprintId: sprint._id })
      .populate('epicId', 'title color')
      .populate('assignedTo', 'name email avatarColor');

    const totalStories = stories.length;
    const completedStories = stories.filter((s) => s.status === 'ready_qa').length;
    const blockedCount = stories.filter((s) => s.isBlocked).length;

    const hoursEstimated = stories.reduce((acc, s) => acc + (s.estimatedHours || 0), 0);
    const hoursLogged = stories.reduce((acc, s) => acc + (s.loggedHours || 0), 0);

    const hoursProgressPercentage =
      hoursEstimated > 0
        ? Number(((hoursLogged / hoursEstimated) * 100).toFixed(2))
        : totalStories > 0
        ? Number(((completedStories / totalStories) * 100).toFixed(2))
        : 0;

    const pointsTotal = stories.reduce((acc, s) => acc + (s.difficulty || 0), 0);
    const pointsCompleted = stories
      .filter((s) => s.status === 'ready_qa')
      .reduce((acc, s) => acc + (s.difficulty || 0), 0);

    const pointsProgressPercentage =
      pointsTotal > 0
        ? Number(((pointsCompleted / pointsTotal) * 100).toFixed(2))
        : 0;

    const columnCounts = {
      todo: stories.filter((s) => s.status === 'todo').length,
      in_progress: stories.filter((s) => s.status === 'in_progress').length,
      to_be_tested: stories.filter((s) => s.status === 'to_be_tested').length,
      ready_qa: completedStories
    };

    return res.json({
      sprintId: sprint._id,
      name: sprint.name,
      status: sprint.status,
      goal: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      startedAt: sprint.startedAt,
      completedAt: sprint.completedAt,
      totalStories,
      completedStories,
      blockedCount,
      hoursEstimated,
      hoursLogged,
      hoursProgressPercentage,
      pointsTotal,
      pointsCompleted,
      pointsProgressPercentage,
      columnCounts,
      stories
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
