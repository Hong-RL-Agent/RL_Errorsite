import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './components/AppShell';
import MonthPage from './pages/MonthPage';
import WeekPage from './pages/WeekPage';
import DayPage from './pages/DayPage';
import SearchPage from './pages/SearchPage';
import EventDetailPage from './pages/EventDetailPage';
import NewEventPage from './pages/NewEventPage';
import EventEditPage from './pages/EventEditPage';
import PreviewPage from './pages/PreviewPage';
import NotesPage from './pages/NotesPage';
import TasksPage from './pages/TasksPage';
import NotificationsPage from './pages/NotificationsPage';
import ActivityPage from './pages/ActivityPage';

export default function App() {
  // 초기화(Reset) 시 epoch 를 올려 모든 화면 상태를 새로 시작한다.
  const [epoch, setEpoch] = useState(0);

  return (
    <AppProvider key={epoch} onResetDone={() => setEpoch((e) => e + 1)}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/calendar/month" replace />} />
          <Route path="/calendar/month" element={<MonthPage />} />
          <Route path="/calendar/week" element={<WeekPage />} />
          <Route path="/calendar/day" element={<DayPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/events/new" element={<NewEventPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/edit" element={<EventEditPage />} />
          <Route path="/events/:id/notes" element={<NotesPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="*" element={<Navigate to="/calendar/month" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
