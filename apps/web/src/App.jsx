import { Route, Routes } from 'react-router-dom';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { AppShell } from './components/layout/AppShell';
import { DemoWorkspaceProvider } from './context/DemoWorkspaceContext';
import { ToastProvider } from './context/ToastContext';
import { ActivityDetailPage } from './pages/ActivityDetailPage';
import { CatalogPage } from './pages/CatalogPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ResultsPage } from './pages/ResultsPage';
import { SimulationPage } from './pages/SimulationPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { StudentActivitiesPage } from './pages/student/StudentActivitiesPage';
import { StudentActivityDetailPage } from './pages/student/StudentActivityDetailPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { TeacherActivitiesPage } from './pages/teacher/TeacherActivitiesPage';
import { TeacherActivityEditorPage } from './pages/teacher/TeacherActivityEditorPage';
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { TeacherMonitoringPage } from './pages/teacher/TeacherMonitoringPage';
import { TeacherResultsPage } from './pages/teacher/TeacherResultsPage';
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage';

/**
 * Enrutado completo de la plataforma.
 *
 * Todas las rutas provienen de `APP_ROUTES` en el paquete compartido, de modo
 * que ninguna pantalla puede enlazar a una dirección inexistente y el 404 solo
 * aparece ante direcciones realmente desconocidas.
 *
 * No hay guardas de autenticación: el backend aún no existe y los accesos a
 * las vistas de demostración se hacen de forma explícita desde las pantallas de
 * acceso y desde la portada.
 */
export function App() {
  return (
    <ToastProvider>
      <DemoWorkspaceProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path={APP_ROUTES.home} element={<HomePage />} />

            <Route path={APP_ROUTES.login} element={<LoginPage />} />
            <Route path={APP_ROUTES.register} element={<RegisterPage />} />
            <Route path={APP_ROUTES.forgotPassword} element={<ForgotPasswordPage />} />

            <Route path={APP_ROUTES.simulations} element={<CatalogPage />} />
            <Route path={APP_ROUTES.activityDetail} element={<ActivityDetailPage />} />
            <Route path={APP_ROUTES.simulation} element={<SimulationPage />} />
            <Route path={APP_ROUTES.results} element={<ResultsPage />} />

            <Route path={APP_ROUTES.studentDashboard} element={<StudentDashboardPage />} />
            <Route path={APP_ROUTES.studentActivities} element={<StudentActivitiesPage />} />
            <Route path={APP_ROUTES.studentActivityDetail} element={<StudentActivityDetailPage />} />
            <Route path={APP_ROUTES.studentProfile} element={<StudentProfilePage />} />

            <Route path={APP_ROUTES.teacherDashboard} element={<TeacherDashboardPage />} />
            <Route path={APP_ROUTES.teacherActivities} element={<TeacherActivitiesPage />} />
            <Route path={APP_ROUTES.teacherActivityCreate} element={<TeacherActivityEditorPage />} />
            <Route path={APP_ROUTES.teacherActivityEdit} element={<TeacherActivityEditorPage />} />
            <Route path={APP_ROUTES.teacherStudents} element={<TeacherStudentsPage />} />
            <Route path={APP_ROUTES.teacherMonitoring} element={<TeacherMonitoringPage />} />
            <Route path={APP_ROUTES.teacherResults} element={<TeacherResultsPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </DemoWorkspaceProvider>
    </ToastProvider>
  );
}
