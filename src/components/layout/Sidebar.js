import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0">
            <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
                <ul className="space-y-2 font-medium">
                    <li>
                        <NavLink to="/dashboard" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                            <span className="ml-3">Dashboard</span>
                        </NavLink>
                    </li>
                    {/* Add other navigation items */}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;