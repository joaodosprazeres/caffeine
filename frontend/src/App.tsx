import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthProvider } from './services/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import Skeleton from './components/Skeleton';
import NavegacaoPrincipal from './components/NavegacaoPrincipal';
import RankingGeralPage from './pages/RankingGeralPage';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegistroPage = lazy(() => import('./pages/RegistroPage'));
const NovaOpiniaoPage = lazy(() => import('./pages/NovaOpiniaoPage'));
const OpiniaoPage = lazy(() => import('./pages/OpiniaoPage'));
const CafePage = lazy(() => import('./pages/CafePage'));
const MeuRankingPage = lazy(() => import('./pages/MeuRankingPage'));
const PerfilPage = lazy(() => import('./pages/PerfilPage'));
const BuscaUsuariosPage = lazy(() => import('./pages/BuscaUsuariosPage'));
const SeguidosPage = lazy(() => import('./pages/SeguidosPage'));

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavegacaoPrincipal />
        <Suspense fallback={<Skeleton className="h-6 m-8" linhas={3} />}>
          <Routes>
            <Route path="/" element={<RankingGeralPage />} />
            <Route path="/cafes/:cafeId" element={<CafePage />} />
            <Route path="/u/:username" element={<PerfilPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/opinioes/:opiniaoId" element={<OpiniaoPage />} />
            <Route
              path="/opinioes/nova"
              element={
                <ProtectedRoute>
                  <NovaOpiniaoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meu-ranking"
              element={
                <ProtectedRoute>
                  <MeuRankingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buscar-usuarios"
              element={
                <ProtectedRoute>
                  <BuscaUsuariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seguidos"
              element={
                <ProtectedRoute>
                  <SeguidosPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
