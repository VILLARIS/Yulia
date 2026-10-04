import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './mvp/AuthContext';
import { AuthPage } from './mvp/AuthPage';
import { CourseEditorPage } from './mvp/CourseEditorPage';
import { CoursePage } from './mvp/CoursePage';
import { CoursesPage } from './mvp/CoursesPage';
import { HomePage } from './mvp/HomePage';
import { MvpShell } from './mvp/MvpShell';
import { RouteGuard } from './mvp/RouteGuard';
import { SimulationDetailPage } from './mvp/SimulationDetailPage';
import { SimulationEditorPage } from './mvp/SimulationEditorPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return <AuthProvider><Routes>
    <Route element={<MvpShell />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/acceso" element={<AuthPage mode="login" />} />
      <Route path="/registro" element={<AuthPage mode="register" />} />
      <Route element={<RouteGuard role="teacher" />}>
        <Route path="/docente" element={<CoursesPage />} />
        <Route path="/docente/cursos/nuevo" element={<CourseEditorPage />} />
        <Route path="/docente/cursos/:courseId" element={<CoursePage />} />
        <Route path="/docente/cursos/:courseId/editar" element={<CourseEditorPage />} />
        <Route path="/docente/cursos/:courseId/simulaciones/nueva" element={<SimulationEditorPage />} />
        <Route path="/docente/simulaciones/:simulationId/editar" element={<SimulationEditorPage />} />
      </Route>
      <Route element={<RouteGuard role="student" />}>
        <Route path="/estudiante" element={<CoursesPage />} />
        <Route path="/estudiante/cursos/:courseId" element={<CoursePage />} />
        <Route path="/estudiante/simulaciones/:simulationId" element={<SimulationDetailPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes></AuthProvider>;
}
