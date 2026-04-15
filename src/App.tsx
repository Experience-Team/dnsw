import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './components/AppShell';
import HomePage from './views/HomePage';
import JourneyMapView from './views/JourneyMapView';
import JourneySpecificView from './views/JourneySpecificView';
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
          <Route index element={<JourneyMapView />} />
          <Route path="journeys" element={<JourneySpecificView />} />
          <Route path="content"  element={<AdaptiveContentView />} />
          <Route path="gaps"     element={<GapsDashboard />} />
          <Route path="personas" element={<PersonaGallery />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
