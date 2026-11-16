import { HashRouter, Route, Routes } from 'react-router';

import { SignupPage } from '@/capabilities/alert-signup';
import { ImpactPage, LookupPage } from '@/capabilities/flood-risk';
import { Layout } from '@/shared/components/Layout';
import { HomePage } from '@/shared/pages/HomePage';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';
import { TeamPage } from '@/shared/pages/TeamPage';

export function MainRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="consulta" element={<LookupPage />} />
          <Route path="impacto" element={<ImpactPage />} />
          <Route path="alertas" element={<SignupPage />} />
          <Route path="equipe" element={<TeamPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
