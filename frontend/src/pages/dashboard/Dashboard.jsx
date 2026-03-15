import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ParentDashboard from '@/components/dashboard/ParentDashboard'; 
import StudentDashboard from '@/components/dashboard/StudentDashboard'; // We will create this

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      {user?.role === 'parent' ? (
        <ParentDashboard />
      ) : (
        <StudentDashboard />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;