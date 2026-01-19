import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './AppNavbar';

const AppLayout: React.FC = () => {
  return (
    <div className='d-flex flex-column h-100'>
      <Navbar />
      <main className='main-content'>
        <Outlet />
      </main>
      {/* TODO [LB-5]: Add footer */}
    </div>
  );
};

export default AppLayout;
