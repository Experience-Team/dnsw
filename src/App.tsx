import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './components/AppShell';
import HomePage from './views/HomePage';
import CustomerJourneyMapView from './views/CustomerJourneyMapView';
import AdaptiveContentView from './views/AdaptiveContentView';
import GapsDashboard from './views/GapsDashboard';
import PersonaGallery from './views/PersonaGallery';

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
          <Route index element={<Navigate to="cjm" replace />} />
          <Route path="cjm"      element={<CustomerJourneyMapView />} />
          <Route path="usm"      element={<PersonaGallery />} />
          <Route path="content"  element={<AdaptiveContentView />} />
          <Route path="quotes"   element={<GapsDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
