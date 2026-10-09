const INITIAL_ASSIGNEES = [
  { id: 1, name: 'Alice', role: 'Frontend Lead', avatarColor: '#3b82f6' },
  { id: 2, name: 'Brian', role: 'Backend Engineer', avatarColor: '#10b981' },
  { id: 3, name: 'Chloe', role: 'UI/UX Designer', avatarColor: '#8b5cf6' },
  { id: 4, name: 'David', role: 'DevOps Engineer', avatarColor: '#f59e0b' }
];

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Landing Page Review',
    description: 'Review landing page typography, responsive breakpoints and asset sizing.',
    status: 'TODO',
    priority: 'HIGH',
    assignee_id: 1,
    created_at: '2026-03-01T10:00:00.000Z',
    updated_at: '2026-03-01T10:00:00.000Z',
    is_deleted: 0
  },
  {
    id: 2,
    title: 'API Documentation',
    description: 'Write OpenAPI documentation for third-party billing and webhook integrations.',
    status: 'TODO',
    priority: 'MEDIUM',
    assignee_id: 2,
    created_at: '2026-03-02T11:00:00.000Z',
    updated_at: '2026-03-02T11:00:00.000Z',
    is_deleted: 0
  },
  {
    id: 3,
    title: 'Mobile Layout Check',
    description: 'Check navigation drawer and table responsiveness on smaller viewport devices.',
    status: 'TODO',
    priority: 'LOW',
    assignee_id: 3,
    created_at: '2026-03-03T12:00:00.000Z',
    updated_at: '2026-03-03T12:00:00.000Z',
    is_deleted: 0
  },
  {
    id: 4,
    title: 'Payment Integration',
    description: 'Integrate Stripe payment intent and recurring subscription webhook handling.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignee_id: 1,
    created_at: '2026-03-04T13:00:00.000Z',
    updated_at: '2026-03-04T13:00:00.000Z',
    is_deleted: 0
  },
  {
    id: 5,
    title: 'Dashboard Redesign',
    description: 'Revamp analytics widgets, throughput graphs, and user retention charts.',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    assignee_id: 4,
    created_at: '2026-03-05T14:00:00.000Z',
    updated_at: '2026-03-05T14:00:00.000Z',
    is_deleted: 0
  },
  {
    id: 6,
    title: 'Database Migration',
    description: 'Migrate legacy relational models to optimized normalized schema partitions.',
    status: 'DONE',
    priority: 'HIGH',
    assignee_id: 2,
    created_at: '2026-03-06T15:00:00.000Z',
    updated_at: '2026-03-06T15:00:00.000Z',
    is_deleted: 0
  },
  {
    id: 7,
    title: 'Login Page',
    description: 'Implement secure MFA authentication forms and OAuth single sign-on flows.',
    status: 'DONE',
    priority: 'MEDIUM',
    assignee_id: 3,
    created_at: '2026-03-07T16:00:00.000Z',
    updated_at: '2026-03-07T16:00:00.000Z',
    is_deleted: 0
  }
];

module.exports = {
  INITIAL_ASSIGNEES,
  INITIAL_TASKS
};
