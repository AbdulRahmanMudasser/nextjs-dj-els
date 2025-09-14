import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to LMS Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your comprehensive Learning Management System
          </p>
          
          {isAuthenticated ? (
            <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome back, {user?.user.first_name}!
              </h2>
              <p className="text-gray-600 mb-6">
                You are logged in as a {user?.role}. Access your courses, assignments, and messages from the navigation above.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Courses</h3>
                  <p className="text-blue-700 text-sm">View and manage your courses</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Assignments</h3>
                  <p className="text-green-700 text-sm">Submit and track assignments</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Messages</h3>
                  <p className="text-purple-700 text-sm">Communicate with instructors</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Get Started
              </h2>
              <p className="text-gray-600 mb-6">
                Sign in to access your courses, assignments, and learning materials.
              </p>
              <div className="flex space-x-4 justify-center">
                <a
                  href="/login"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Create Account
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
