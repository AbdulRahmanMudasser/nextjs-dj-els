'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { useSearch } from '@/hooks/useSearch';
import { Menu, Bell, Search, User, LogOut, Settings, Shield, X, Clock, Check } from 'lucide-react';
import { UserProfile } from '@/types';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  onMenuClick: () => void;
  user: UserProfile;
}

export default function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  const { logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { query, results, loading: searchLoading, setQuery, clearResults } = useSearch();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrator',
      'FACULTY': 'Faculty Member',
      'STUDENT': 'Student',
      'PARENT': 'Parent',
      'LIBRARIAN': 'Librarian',
    };
    return roleMap[role] || role;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open navigation menu"
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search */}
            <div className="hidden md:block ml-4" ref={searchRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users, courses, reports..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                
                {/* Search Results Dropdown */}
                {showSearch && (query || results.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm">Searching...</p>
                      </div>
                    ) : results.length > 0 ? (
                      <div className="py-1">
                        {results.map((result) => (
                          <Link
                            key={result.id}
                            href={result.url}
                            className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              setShowSearch(false);
                              clearResults();
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {result.title}
                              </p>
                              {result.description && (
                                <p className="text-xs text-gray-500 truncate">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            <span className="ml-2 text-xs text-gray-400 capitalize">
                              {result.type}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : query ? (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">No results found for "{query}"</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-400 rounded-full"></span>
                )}
              </button>
              
              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-500 flex items-center"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    {notifications.length > 0 ? (
                      <div className="space-y-3">
                        {notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "flex items-start space-x-3 p-2 rounded-md transition-colors",
                              !notification.is_read ? "bg-blue-50" : "hover:bg-gray-50"
                            )}
                          >
                            <div className="flex-shrink-0">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-2",
                                notification.type === 'error' ? "bg-red-400" :
                                notification.type === 'warning' ? "bg-yellow-400" :
                                notification.type === 'success' ? "bg-green-400" :
                                "bg-blue-400"
                              )}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500">{notification.message}</p>
                              <p className="text-xs text-gray-400 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex flex-col space-y-1">
                              {!notification.is_read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-blue-600 hover:text-blue-500"
                                >
                                  Mark read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-xs text-red-600 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications</p>
                      </div>
                    )}
                    
                    {notifications.length > 5 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Link
                          href="/admin/notifications"
                          className="text-sm text-blue-600 hover:text-blue-500"
                          onClick={() => setShowNotifications(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-md text-gray-700 hover:bg-gray-100"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <div className="flex-shrink-0">
                  {user.profile_picture ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.profile_picture}
                      alt={user.full_name || user.username}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRoleDisplayName(user.role || 'USER')}
                  </p>
                </div>
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    
                    <Link
                      href="/admin/system/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                    
                    <Link
                      href="/admin/users/roles"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Shield className="mr-3 h-4 w-4" />
                      Permissions
                    </Link>
                    
                    <div className="border-t border-gray-100"></div>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
