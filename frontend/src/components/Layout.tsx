'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Menu, X, User, LogOut, BookOpen, Users, MessageSquare, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated, permissions } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrator',
      'FACULTY': 'Faculty',
      'STUDENT': 'Student',
      'PARENT': 'Parent',
      'LIBRARIAN': 'Librarian',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  LMS Platform
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  {permissions?.can_manage_courses && (
                    <Link 
                      href="/courses" 
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Courses</span>
                    </Link>
                  )}
                  {permissions?.can_view_grades && (
                    <Link 
                      href="/assignments" 
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Assignments</span>
                    </Link>
                  )}
                  {permissions?.can_communicate && (
                    <Link 
                      href="/messages" 
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Messages</span>
                    </Link>
                  )}
                  {permissions?.can_access_admin && (
                    <Link 
                      href="/admin" 
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* User Menu - Desktop */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.full_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getRoleDisplayName(user?.role || '')}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      href="/profile" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    {permissions?.can_manage_courses && (
                      <Link 
                        href="/courses" 
                        className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Courses</span>
                      </Link>
                    )}
                    {permissions?.can_view_grades && (
                      <Link 
                        href="/assignments" 
                        className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Assignments</span>
                      </Link>
                    )}
                    {permissions?.can_communicate && (
                      <Link 
                        href="/messages" 
                        className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Messages</span>
                      </Link>
                    )}
                    {permissions?.can_access_admin && (
                      <Link 
                        href="/admin" 
                        className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="px-3 py-2">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getRoleDisplayName(user?.role || '')}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full text-left bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <Link 
                    href="/auth" 
                    className="flex items-center space-x-3 bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
