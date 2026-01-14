import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/dashboard/Dashboard';
import Analytics from '@/pages/analytics/Analytics'; // Import Analytics
import Budgets from '@/pages/budgets/Budgets'; // Add this import
import Expenses from '@/pages/expenses/Expenses'; 
import Categories from '@/pages/categories/Categories'; // <--- CHECK THIS LINE
import Profile from './pages/profile/Profile';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* New Route */}
          <Route path="/analytics" element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          } />
           {/* Add this Route */}
          <Route path="/expenses" element={
            <PrivateRoute>
              <Expenses />
            </PrivateRoute>
          } />
           {/* ADD THIS NEW ROUTE */}
          <Route path="/budgets" element={
            <PrivateRoute>
              <Budgets />
            </PrivateRoute>
          } />
             {/* Add New Route */}
          <Route path="/categories" element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
          <PrivateRoute>
           <Profile />
          </PrivateRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;