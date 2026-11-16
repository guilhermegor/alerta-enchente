import { AlertSignupProvider } from '@/capabilities/alert-signup';
import { FloodRiskProvider } from '@/capabilities/flood-risk';
import { MainRouter } from '@/routes/MainRouter';

const App = () => (
  <FloodRiskProvider>
    <AlertSignupProvider>
      <MainRouter />
    </AlertSignupProvider>
  </FloodRiskProvider>
);

export default App;
