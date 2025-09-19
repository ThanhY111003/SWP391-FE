import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Header = () => {
    const navigate = useNavigate();
    return (
        <header className="fixed w-full z-50 bg-white border-b border-gray-200">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start">
                        <button onClick={() => navigate('/')} className="flex ml-2 md:mr-24">
                            <img src={logo} className="h-8 mr-3" alt="Bird Trading Logo" />
                            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">Bird Trading</span>
                        </button>
                    </div>
                    <div className="flex items-center">
                        {/* Add user profile/logout buttons here */}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;