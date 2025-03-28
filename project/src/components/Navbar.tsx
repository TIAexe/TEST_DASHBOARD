import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Layout, Settings, CreditCard, Download, History, RefreshCw, MessagesSquare } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Layout className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">License Dashboard</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;