import "./index.css"
import "./dashboard-header.css"
import  TransactionMenu from "./Dashboard-menu.tsx"
import CategoryMenu from "./CategoryMenu.tsx"
import Backdrop from "./Dashboard-backdrop.tsx"

import {useState} from 'react'
import {supabase} from "./SupabaseClient.tsx";

export default function DashboardHeader() {
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
                    <button onClick={handleSignOut}>Sign Out</button>
                    <button onClick={handleMenuToggle}>Add Expense</button>
                    <button onClick={handleCategoryToggle}>Add Category</button>
                </div>
            </nav>
            {isMenuOpen && <TransactionMenu onClose={closeMenu} />}
            {isMenuOpen && <Backdrop onClose={closeMenu} />}
            {isCategoryOpen && <CategoryMenu onClose={closeCategory} />}
            {isCategoryOpen && <Backdrop onClose={closeCategory} />}
        </header>
    )
}