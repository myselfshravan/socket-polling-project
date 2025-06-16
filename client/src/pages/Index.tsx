
import React from 'react';
import { usePoll } from '../context/PollContext';
import Home from './Home';
import TeacherDashboard from '../components/TeacherDashboard';
import StudentInterface from '../components/StudentInterface';

const Index = () => {
  const { currentUser } = usePoll();

  if (!currentUser) {
    return <Home />;
  }

  if (currentUser.role === 'teacher') {
    return <TeacherDashboard />;
  }

  return <StudentInterface />;
};

export default Index;
