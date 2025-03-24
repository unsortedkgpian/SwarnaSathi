import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Layers, 
  Image, 
  Users2, 
  DollarSign, 
  Mail, 
  ShoppingCartIcon, 
  FileText, 
  Settings, 
  ChevronDown, 
  HelpCircle, 
  Briefcase, 
  MapPin, 
  UserPlus 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout, auth } = useContext(AuthContext);
  const [isMenuOpenD, setIsMenuOpenD] = useState(false);
  const [isMenuOpenS, setIsMenuOpenS] = useState(false);
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white w-64">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      
      <div className="px-4 py-2">
        <button
          onClick={() => setIsMenuOpenD(!isMenuOpenD)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-700 rounded hover:bg-gray-600"
        >
          <span className="text-lg font-semibold">DhruvaCapital</span>
          <ChevronDown size={20} className={`${isMenuOpenD ? 'rotate-180' : ''} transition-transform`} />
        </button>
        
        {isMenuOpenD && (
          <div className="mt-2 bg-gray-700 rounded">
            <nav className="flex flex-col">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${isActive('/dashboard') ? 'bg-gray-600' : ''}`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>

              {auth.user?.role === 'admin' && (
                <>
                  <Link
                    to="/dashboard/register"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${isActive('/dashboard/register') ? 'bg-gray-600' : ''}`}
                  >
                    <Users size={20} />
                    <span>Register User</span>
                  </Link>
                  <Link
                    to="/dashboard/categories"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/categories') ? 'bg-gray-600' : ''}`}
                  >
                    <Layers size={20} />
                    <span>Categories</span>
                  </Link>
                  <Link
                    to="/dashboard/banners"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/banners') ? 'bg-gray-600' : ''}`}
                  >
                    <Image size={20} />
                    <span>Banners</span>
                  </Link>
                  <Link
                    to="/dashboard/products"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/products') ? 'bg-gray-600' : ''}`}
                  >
                    <ShoppingCartIcon size={20} />
                    <span>Products</span>
                  </Link>
                  <Link
                    to="/dashboard/team"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/team') ? 'bg-gray-600' : ''}`}
                  >
                    <Users2 size={20} />
                    <span>Team</span>
                  </Link>
                  <Link
                    to="/dashboard/investor-desk"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/investor-desk') ? 'bg-gray-600' : ''}`}
                  >
                    <FileText size={20} />
                    <span>Investor's Desk</span>
                  </Link>
                  <Link
                    to="/dashboard/newsletter"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/newsletter') ? 'bg-gray-600' : ''}`}
                  >
                    <Mail size={20} />
                    <span>Newsletter</span>
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/settings') ? 'bg-gray-600' : ''}`}
                  >
                    <Settings size={20} />
                    <span>Settings</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      <div className="px-4 py-2">
        <button
          onClick={() => setIsMenuOpenS(!isMenuOpenS)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-700 rounded hover:bg-gray-600"
        >
          <span className="text-lg font-semibold">SwrnaSathi</span>
          <ChevronDown size={20} className={`${isMenuOpenS ? 'rotate-180' : ''} transition-transform`} />
        </button>
        
        {isMenuOpenS && (
          <div className="mt-2 bg-gray-700 rounded">
            <nav className="flex flex-col">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${isActive('/dashboard') ? 'bg-gray-600' : ''}`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>

              {auth.user?.role === 'admin' && (
                <>
                  <Link
                    to="/dashboard/partners"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/partners') ? 'bg-gray-600' : ''}`}
                  >
                    <Image size={20} />
                    <span>Partners</span>
                  </Link>
                  <Link
                    to="/dashboard/hiws"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/hiws') ? 'bg-gray-600' : ''}`}
                  >
                    <Layers size={20} />
                    <span>How It Works</span>
                  </Link>
                  <Link
                    to="/dashboard/faqs"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/faqs') ? 'bg-gray-600' : ''}`}
                  >
                    <HelpCircle size={20} />
                    <span>FAQs</span>
                  </Link>
                  <Link
                    to="/dashboard/team-members"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/team-members') ? 'bg-gray-600' : ''}`}
                  >
                    <Users2 size={20} />
                    <span>Team Members</span>
                  </Link>
                  <Link
                    to="/dashboard/form-submissions"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/form-submissions') ? 'bg-gray-600' : ''}`}
                  >
                    <FileText size={20} />
                    <span>Form Submissions</span>
                  </Link>
                  <Link
                    to="/dashboard/job-openings"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/job-openings') ? 'bg-gray-600' : ''}`}
                  >
                    <Briefcase size={20} />
                    <span>Job Openings</span>
                  </Link>
                  <Link
                    to="/dashboard/store-locations"
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-600 ${location.pathname.startsWith('/dashboard/store-locations') ? 'bg-gray-600' : ''}`}
                  >
                    <MapPin size={20} />
                    <span>Store Locations</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={logout}
          className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-gray-700 rounded"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}