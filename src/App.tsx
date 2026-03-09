import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Upload from './pages/Upload';
import MatchAnalysis from './pages/MatchAnalysis';
import Comparison from './pages/Comparison';
import Recommendations from './pages/Recommendations';
import Heatmaps from './pages/Heatmaps';
import TeamDetails from './pages/TeamDetails';
import PlayerProfile from './pages/PlayerProfile';
import Settings from './pages/Settings';
import About from './pages/About';
import Support from './pages/Support';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background text-white selection:bg-primary selection:text-background">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Support />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/analysis/:id?" element={<MatchAnalysis />} />
                <Route path="/comparison" element={<Comparison />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/heatmaps/:id?" element={<Heatmaps />} />
                <Route path="/team/:id" element={<TeamDetails />} />
                <Route path="/player/:id" element={<PlayerProfile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
