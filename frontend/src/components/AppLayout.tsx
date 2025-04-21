import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const AppLayout: React.FC = () => {
    return (
        <div>
            <Navbar/>
            <main className='main-content'>
                <Outlet/>
            </main>
            {/* TODO [LB-5]: Add footer */}
        </div>
    )
}

export default AppLayout;