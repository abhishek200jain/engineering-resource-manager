import TeamOverview from '../components/TeamOverview';
import Layout from '../components/Layout';

const ManagerDashboard = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
      <TeamOverview />
    </Layout>
  );
}

export default ManagerDashboard; 