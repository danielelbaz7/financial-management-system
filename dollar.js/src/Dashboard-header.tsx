import "./index.css"
import "./dashboard-header.css"
import  TransactionMenu from "./Dashboard-menu.tsx"
import CategoryMenu from "./CategoryMenu.tsx"
import Backdrop from "./Dashboard-backdrop.tsx"

import {useState} from 'react'
import {supabase} from "./SupabaseClient.tsx";
import * as React from "react";

export default function DashboardHeader({admin, obtainTransactions}: {admin: boolean, obtainTransactions: any}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const closeCategory = () => {
        setIsCategoryOpen(false);
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleCategoryToggle = () => {
        setIsCategoryOpen(!isCategoryOpen);
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (!error) window.location.href = "/"
    }

    return(
        <header className="dashboard-header">
            <nav className="top-bar">
                <div className="logo-transaction">
                    <div>Dollar.js</div>
                    <button className="cursor-pointer" onClick={handleSignOut}>Sign Out</button>
                    <button className="cursor-pointer" onClick={handleMenuToggle}>Add Transaction</button>
                    <button className="cursor-pointer" onClick={handleCategoryToggle}>Add Category</button>
                    <div className={admin ? `font-bold text-red-500` : `font-bold text-white`}>
                        {admin ? "ADMIN" : "USER"}
                    </div>
                </div>
            </nav>
            {isMenuOpen && <TransactionMenu obtainTransactions={obtainTransactions} onClose={closeMenu} />}
            {isMenuOpen && <Backdrop onClose={closeMenu} />}
            {isCategoryOpen && <CategoryMenu onClose={closeCategory} />}
            {isCategoryOpen && <Backdrop onClose={closeCategory} />}
        </header>
    )
}