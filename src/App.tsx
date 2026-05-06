import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './components/AppShell';
import HomePage from './views/HomePage';
import UserJourneyMapView from './views/UserJourneyMapView';
import CustomerJourneyMapView from './views/CustomerJourneyMapView';
import AdaptiveContentView from './views/AdaptiveContentView';
import GapsDashboard from './views/GapsDashboard';
import PersonaGallery from './views/PersonaGallery';
import SitemapView from './views/SitemapView';

function JourneyMapLayout() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/journey-map" element={<JourneyMapLayout />}>
          <Route index element={<Navigate to="ujm" replace />} />
          <Route path="ujm"     element={<UserJourneyMapView />} />
          <Route path="cjm"     element={<CustomerJourneyMapView />} />
          <Route path="usm"     element={<PersonaGallery />} />
          <Route path="content" element={<AdaptiveContentView />} />
          <Route path="quotes"  element={<GapsDashboard />} />
          <Route path="sitemap" element={<SitemapView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
