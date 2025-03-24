import React, { useState } from 'react';
import Users from '../Models/Users';
import CategoryForm from '../Models/Category';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('Users');

  // Mock data - replace with actual API call
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Dashboard</h2>
          <nav>
            <ul>
              <li>
                <button
                  className={`w-full text-left px-4 py-2 rounded ${activePage === 'Users' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  onClick={() => setActivePage('Users')}
                >
                  Users
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-4 py-2 rounded ${activePage === 'Category' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  onClick={() => setActivePage('Category')}
                >
                  Category
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-6">
        {activePage === 'Users' && (
          <Users users={users} />
              )}
        {activePage === 'Category' && (
         <CategoryForm />
        )}
      </main>
    </div>
  );
}