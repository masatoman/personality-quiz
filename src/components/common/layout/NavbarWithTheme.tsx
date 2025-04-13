import React from 'react';
import Navbar from './Navbar';
import ThemeSwitcher from './ThemeSwitcher';

const NavbarWithTheme: React.FC = () => {
  return (
    <div className="relative">
      <Navbar />
      <div className="absolute right-4 top-4 md:right-8 md:top-5">
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default NavbarWithTheme; 