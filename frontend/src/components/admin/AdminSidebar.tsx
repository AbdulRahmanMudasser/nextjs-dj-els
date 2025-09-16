'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/contexts/PermissionContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  MessageSquare,
  FileText,
  Database,
  Shield,
  Bell,
  X,
  UserPlus,
  Upload,
  UserCheck,
  Building2,
  BookMarked,
  CalendarDays,
  UserCog,
  TrendingUp,
  PieChart,
  Activity,
  Server,
  HardDrive,
  History,
  Mail,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  children?: NavItem[];
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);


  // Auto-expand parent items if child is active
  useEffect(() => {
    const activeParents: string[] = [];
    navigation.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          pathname === child.href || pathname.startsWith(child.href + '/')
        );
        if (hasActiveChild) {
          activeParents.push(item.name);
        }
      }
    });
    setExpandedItems(activeParents);
  }, [pathname]);

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      permission: 'can_view_all_users',
      children: [
        {
          name: 'All Users',
          href: '/admin/users',
          icon: Users,
        },
        {
          name: 'Add User',
          href: '/admin/users/add',
          icon: UserPlus,
        },
        {
          name: 'Bulk Import',
          href: '/admin/users/import',
          icon: Upload,
        },
        {
          name: 'User Roles',
          href: '/admin/users/roles',
          icon: UserCheck,
        },
      ],
    },
    {
      name: 'Academic',
      href: '/admin/academic',
      icon: GraduationCap,
      permission: 'can_manage_departments',
      children: [
        {
          name: 'Departments',
          href: '/admin/academic/departments',
          icon: Building2,
        },
        {
          name: 'Programs',
          href: '/admin/academic/programs',
          icon: BookMarked,
        },
        {
          name: 'Courses',
          href: '/admin/academic/courses',
          icon: BookOpen,
        },
        {
          name: 'Semesters',
          href: '/admin/academic/semesters',
          icon: CalendarDays,
        },
        {
          name: 'Enrollments',
          href: '/admin/academic/enrollments',
          icon: UserCog,
        },
      ],
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: BarChart3,
      permission: 'can_generate_reports',
      children: [
        {
          name: 'Standard Reports',
          href: '/admin/reports/standard',
          icon: FileText,
        },
        {
          name: 'Custom Reports',
          href: '/admin/reports/custom',
          icon: TrendingUp,
        },
        {
          name: 'Analytics',
          href: '/admin/reports/analytics',
          icon: PieChart,
        },
      ],
    },
    {
      name: 'System',
      href: '/admin/system',
      icon: Settings,
      permission: 'can_modify_system_settings',
      children: [
        {
          name: 'Settings',
          href: '/admin/system/settings',
          icon: Settings,
        },
        {
          name: 'Monitoring',
          href: '/admin/system/monitoring',
          icon: Activity,
        },
        {
          name: 'Backups',
          href: '/admin/system/backups',
          icon: HardDrive,
        },
        {
          name: 'Logs',
          href: '/admin/system/logs',
          icon: History,
        },
      ],
    },
    {
      name: 'Communications',
      href: '/admin/communications',
      icon: MessageSquare,
      permission: 'can_send_announcements',
      children: [
        {
          name: 'Announcements',
          href: '/admin/communications/announcements',
          icon: Bell,
        },
        {
          name: 'Templates',
          href: '/admin/communications/templates',
          icon: FileText,
        },
        {
          name: 'Email History',
          href: '/admin/communications/email-history',
          icon: Mail,
        },
      ],
    },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    // Check permission if required
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);

    return (
      <div key={item.name}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              'group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md transition-colors',
              level === 0 ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              isActive && level === 0 && 'bg-gray-100 text-gray-900',
              level > 0 && 'ml-4'
            )}
            aria-expanded={isExpanded}
            aria-label={`${item.name} menu`}
          >
            <div className="flex items-center">
              <item.icon
                className={cn(
                  'mr-3 flex-shrink-0 h-5 w-5',
                  isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
              level === 0 ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              isActive && level === 0 && 'bg-gray-100 text-gray-900',
              isActive && level > 0 && 'bg-gray-50 text-gray-900',
              level > 0 && 'ml-4'
            )}
            onClick={() => onClose()} // Close sidebar on mobile after navigation
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon
              className={cn(
                'mr-3 flex-shrink-0 h-5 w-5',
                isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            {item.name}
          </Link>
        )}
        
        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-1 space-y-1" role="group" aria-label={`${item.name} submenu`}>
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ zIndex: 50 }}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          <nav className="flex-1 mt-5 px-2 space-y-1">
            {navigation.map((item) => renderNavItem(item))}
          </nav>

          {/* System Status */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              System Online
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
