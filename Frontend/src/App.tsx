import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';
import PageTransition from './components/layout/PageTransition';
import LenisProvider from './components/effects/LenisProvider';
import CustomCursor from './components/effects/CustomCursor';

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

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
                <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                <Route path="/help" element={<PageTransition><Support /></PageTransition>} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                    <Route path="/upload" element={<PageTransition><Upload /></PageTransition>} />
                    <Route path="/analysis/:id?" element={<PageTransition><MatchAnalysis /></PageTransition>} />
                    <Route path="/comparison" element={<PageTransition><Comparison /></PageTransition>} />
                    <Route path="/recommendations" element={<PageTransition><Recommendations /></PageTransition>} />
                    <Route path="/heatmaps/:id?" element={<PageTransition><Heatmaps /></PageTransition>} />
                    <Route path="/team/:id" element={<PageTransition><TeamDetails /></PageTransition>} />
                    <Route path="/player/:id" element={<PageTransition><PlayerProfile /></PageTransition>} />
                    <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
                </Route>
            </Routes>
        </AnimatePresence>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <LenisProvider>
                <Router>
                    <CustomCursor />
                    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-background overflow-x-hidden">
                        <Navbar />
                        <main className="flex-grow">
                            <AnimatedRoutes />
                        </main>
                        <Footer />
                    </div>
                </Router>
            </LenisProvider>
        </AuthProvider>
    );
};

export default App;
