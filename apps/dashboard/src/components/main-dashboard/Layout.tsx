import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  HeartIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Packages', href: '/packages', icon: CubeIcon },
  { name: 'Dependencies', href: '/dependencies', icon: ChartBarIcon },
  { name: 'Health Status', href: '/health', icon: HeartIcon },
  { name: 'Publish Control', href: '/publish', icon: CloudArrowUpIcon },
  { name: 'CI/CD', href: '/ci', icon: CpuChipIcon },
  { name: 'Configuration', href: '/config', icon: Cog6ToothIcon },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-medium">
        <div className="flex h-16 items-center justify-center border-b border-neutral-200">
          <h1 className="text-heading text-xl text-primary-700">MonoDog</h1>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map(item => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`nav-link ${
                      isActive ? 'nav-link-active' : 'nav-link-inactive'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white shadow-soft border-b border-neutral-200 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-heading text-lg font-semibold">
              {navigation.find(item => item.href === location.pathname)?.name ||
                'Dashboard'}
            </h2>
            {/* System stats */}
            <div className="flex items-center gap-6 ml-8">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <CpuChipIcon className="h-5 w-5 text-primary-500" />
                <span>
                  CPU: <span className="font-medium">32%</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <ChartBarIcon className="h-5 w-5 text-primary-500" />
                <span>
                  Memory: <span className="font-medium">2.1 GB / 8 GB</span>
                </span>
              </div>
            </div>
          </div>
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-sm">
              <span className="font-medium text-primary-700">John Doe</span>
              <span className="text-neutral-500">Admin</span>
            </div>
            <img
              src="https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff"
              alt="User Avatar"
              className="h-8 w-8 rounded-full border border-neutral-200"
            />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
