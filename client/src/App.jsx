import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Components that don't need lazy loading
import Sidebar, { SidebarItem } from './components/Sidebar';

// Lazy loaded components
const Task = lazy(() => import('./components/Task'));
const ProjectTask = lazy(() => import('./components/ProjectTask'));
const TimeTracker = lazy(() => import('./components/TimeTracker'));
const PomodoroTimer = lazy(() => import('./components/PomodoroTimer'));
const HabitTracker = lazy(() => import('./components/HabitTracker'));
const Calendar = lazy(() => import('./components/Calendar'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const TodoBoard = lazy(() => import('./components/TodoBoard'));
const BoardsList = lazy(() => import('./components/BoardsList'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));
const Help = lazy(() => import('./components/Help'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./components/auth/VerifyEmail'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

// Icons
import {
    LayoutDashboard,
    Plus,
    ClipboardList,
    Layers,
    Calendar as CalendarIcon,
    Clock,
    Timer,
    BarChart3,
    Settings as SettingsIcon,
    LifeBuoy,
    KanbanSquare
} from "lucide-react";

// Context Providers
import { TaskProvider } from './components/TaskContext';
import { TimerProvider } from './components/TimerContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CustomToastProvider } from './context/ToastContext';

const LoadingFallback = () => (
    <div className="flex justify-center items-center h-screen">Loading...</div>
);

const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <AuthProvider>
            <ThemeProvider>
                <CustomToastProvider>
                    <TaskProvider>
                        <TimerProvider>
                            <Router>
                                <Routes>
                                    <Route path="/" element={<Navigate to="/login" replace />} />
                                    <Route path="/login" element={
                                        <Suspense fallback={<LoadingFallback />}>
                                            <Login />
                                        </Suspense>
                                    } />
                                    <Route path="/register" element={
                                        <Suspense fallback={<LoadingFallback />}>
                                            <Register />
                                        </Suspense>
                                    } />
                                    <Route path="/forgot-password" element={
                                        <Suspense fallback={<LoadingFallback />}>
                                            <ForgotPassword />
                                        </Suspense>
                                    } />
                                    <Route path="/reset-password/:token" element={
                                        <Suspense fallback={<LoadingFallback />}>
                                            <ResetPassword />
                                        </Suspense>
                                    } />
                                    <Route path="/verify-email/:token" element={
                                        <Suspense fallback={<LoadingFallback />}>
                                            <VerifyEmail />
                                        </Suspense>
                                    } />
                                    <Route path="/*" element={
                                        <Suspense fallback={<LoadingFallback />}>
                                            <ProtectedRoute>
                                                <div className="flex bg-white min-h-screen">
                                                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
                                                        <div className="mb-4">
                                                            <h2 className={`text-xs font-semibold text-gray-500 mb-2 px-3 ${!isSidebarOpen && 'hidden'}`}>
                                                                QUICK ACTIONS
                                                            </h2>
                                                            <SidebarItem icon={<Plus />} text="New Task" link="/tasks" />
                                                        </div>

                                                        <div className="mb-4">
                                                            <h2 className={`text-xs font-semibold text-gray-500 mb-2 px-3 ${!isSidebarOpen && 'hidden'}`}>
                                                                MAIN MENU
                                                            </h2>
                                                            <SidebarItem icon={<LayoutDashboard/>} text="Dashboard" link="/dashboard"/>
                                                            <SidebarItem icon={<ClipboardList/>} text="Tasks" link="/tasks"/>
                                                            <SidebarItem icon={<KanbanSquare/>} text="Todo Board" link="/todos"/>
                                                            <SidebarItem icon={<Layers/>} text="All Projects" link="/projects"/>
                                                            <SidebarItem icon={<CalendarIcon/>} text="Calendar" link="/calendar"/>
                                                        </div>

                                                        <div className="mb-4">
                                                            <h2 className={`text-xs font-semibold text-gray-500 mb-2 px-3 ${!isSidebarOpen && 'hidden'}`}>
                                                                PRODUCTIVITY
                                                            </h2>
                                                            <SidebarItem icon={<Clock/>} text="Time Tracker" link="/timer"/>
                                                            <SidebarItem icon={<Timer />} text="Pomodoro" link="/pomodoro" />
                                                            <SidebarItem icon={<BarChart3 />} text="Habits" link="/habits" />
                                                        </div>

                                                        <div className="mb-4">
                                                            <h2 className={`text-xs font-semibold text-gray-500 mb-2 px-3 ${!isSidebarOpen && 'hidden'}`}>
                                                                SUPPORT
                                                            </h2>
                                                            <SidebarItem icon={<SettingsIcon />} text="Settings" link="/settings" />
                                                            <SidebarItem icon={<LifeBuoy />} text="Help" link="/help" />
                                                        </div>
                                                    </Sidebar>

                                                    <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-16'}`}>
                                                        <Routes>
                                                            <Route path="/dashboard" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <Dashboard />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/tasks" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <Task />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/todos" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <BoardsList />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/todos/board/:boardId" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <TodoBoard />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/calendar" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <Calendar />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/projects" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <ProjectTask />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/projects/:projectId" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <ProjectTask />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/timer" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <TimeTracker />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/pomodoro" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <PomodoroTimer />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/habits" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <HabitTracker />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/settings" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <Settings />
                                                                </Suspense>
                                                            } />
                                                            <Route path="/help" element={
                                                                <Suspense fallback={<LoadingFallback />}>
                                                                    <Help />
                                                                </Suspense>
                                                            } />
                                                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                                        </Routes>
                                                    </div>
                                                </div>
                                            </ProtectedRoute>
                                        </Suspense>
                                    } />
                                </Routes>
                            </Router>
                        </TimerProvider>
                    </TaskProvider>
                </CustomToastProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;