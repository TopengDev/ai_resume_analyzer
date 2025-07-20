import React from 'react';
import { Link } from 'react-router';
import { usePuterStore } from '~/lib/puter';

export default function Navbar() {
   const { auth } = usePuterStore();

   return (
      <div className="flex flex-col gap-2 w-full">
         <div className="w-full flex items-center justify-end px-12">
            <button
               className="text-red-500 cursor-pointer"
               onClick={auth.signOut}
            >
               Log out
            </button>
         </div>
         <nav className="navbar">
            <Link to="/">
               <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>
            <Link to="/upload" className={'primary-button w-fit'}>
               Upload Resume
            </Link>
         </nav>
      </div>
   );
}
