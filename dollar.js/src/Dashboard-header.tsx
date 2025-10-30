import "./index.css"
import "./dashboard-header.css"
import  TransactionMenu from "./Dashboard-menu.tsx"
import Backdrop from "./Dashboard-backdrop.tsx"

import {useState} from 'react'
import {supabase} from "./SupabaseClient.tsx";

export default function DashboardHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
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
                    <button className="transaction-button" onClick={handleMenuToggle}>Add Expense</button>
                </div>
            </nav>
            {isMenuOpen && <TransactionMenu onClose={closeMenu} />}
            {isMenuOpen && <Backdrop onClose={closeMenu} />}
        </header>
    )
}