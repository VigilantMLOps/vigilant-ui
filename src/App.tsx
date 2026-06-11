import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Shell from './layout/Shell';
import Landing from './pages/Landing';
import Overview from './pages/Overview';
import Evaluation from './pages/Evaluation';
import FeatureDrift from './pages/FeatureDrift';
import LLMOps from './pages/LLMOps';
import ModelServing from './pages/ModelServing';
import AtlasPack from './pages/AtlasPack';
import AtlasRag from './pages/AtlasRag';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Landing page — no sidebar */}
        <Route index element={<Landing />} />

        {/* Standalone product pages */}
        <Route path="pack" element={<AtlasPack />} />
        <Route path="rag" element={<AtlasRag />} />

        {/* Dashboard shell — sidebar + header */}
        <Route element={<Shell />}>
          <Route path="mlops" element={<Overview />} />
          <Route path="evaluation" element={<Evaluation />} />
          <Route path="feature-drift" element={<FeatureDrift />} />
          <Route path="llm-ops" element={<LLMOps />} />
          <Route path="model-serving" element={<ModelServing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
