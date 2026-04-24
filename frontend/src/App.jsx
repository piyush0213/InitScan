import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Explorer from './pages/Explorer';
import AIQuery from './pages/AIQuery';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import RollupHealth from './pages/RollupHealth';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="explorer" element={<Explorer />} />
        <Route path="query" element={<AIQuery />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="health" element={<RollupHealth />} />
      </Route>
    </Routes>
  );
}
