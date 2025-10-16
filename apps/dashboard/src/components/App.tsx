import { BrowserRouter as Router } from 'react-router-dom';
import { AppRouter } from '../routes';
import { Layout } from '../pages';

export default function App() {
  return (
    <Router>
      <Layout>
        <AppRouter />
      </Layout>
    </Router>
  );
}
