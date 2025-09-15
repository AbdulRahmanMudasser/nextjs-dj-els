'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  Shield, 
  Award,
  CheckCircle,
  Star
} from 'lucide-react';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <Loading text="Loading..." />;
  }

  if (isAuthenticated) {
    return <Loading text="Redirecting to dashboard..." />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20">
            <div className="text-center">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="hidden sm:inline">Modern Learning Management Platform</span>
                <span className="sm:hidden">Modern LMS Platform</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Professional
                <span className="text-blue-600 block">Learning Management</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                A comprehensive platform designed to help educators manage courses, 
                track student progress, and facilitate communication in the learning process.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg"
                  onClick={() => router.push('/auth')}
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg"
                  onClick={() => router.push('/auth')}
                >
                  Sign In
                </Button>
              </div>

              {/* Platform Features */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-500 px-4">
                <div className="flex items-center">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500" />
                  Secure Platform
                </div>
                <div className="flex items-center">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-yellow-500" />
                  User-Friendly
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500" />
                  Reliable Service
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Everything You Need for Modern Education
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Our platform provides all the tools and features needed to create, 
                manage, and deliver exceptional educational experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Course Management</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Create, organize, and manage courses with modules, assignments, 
                    and multimedia resources. Track progress and engagement.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Student Tracking</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Monitor student progress, grades, attendance, and engagement 
                    across all courses with detailed analytics and reports.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
                <CardHeader className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Communication Hub</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Facilitate seamless communication between students, faculty, 
                    and parents with messaging, announcements, and notifications.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Platform Features & Benefits
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Designed to support modern educational needs with essential tools and features.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-sm sm:text-base text-gray-600">Platform Access</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">Multi</div>
                <div className="text-sm sm:text-base text-gray-600">Device Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">Real</div>
                <div className="text-sm sm:text-base text-gray-600">Time Updates</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-lg">
              <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-green-600" />
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
                Secure & Reliable Platform
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
                Built with modern security practices and reliable infrastructure 
                to protect your educational data.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-600" />
                  Data Encryption
                </div>
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-600" />
                  Secure Authentication
                </div>
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-600" />
                  Regular Backups
                </div>
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-600" />
                  Privacy Protection
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    </Layout>
  );
}
