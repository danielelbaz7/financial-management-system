import "./index.css"
import "./dashboard-header.css"
import  TransactionMenu from "./Dashboard-menu.tsx"
import Backdrop from "./Dashboard-backdrop.tsx"
import CategoryMenu from "./CategoryMenu.tsx"

import {useState} from 'react'

export default function DashboardHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [isCMenuOpen, setIsCMenuOpen] = useState(false);

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsCMenuOpen(false);
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleCMenuToggle = () => {
        setIsCMenuOpen(!isCMenuOpen);
    }

    return(
        <header className="dashboard-header">
            <nav className="top-bar">
                <div className="logo-transaction">
                    <div>Dollar.js</div>
                    <div className="buttons">
                        <button className="transaction-button" onClick={handleCMenuToggle}>Add Category</button>
                        <button className="transaction-button" onClick={handleMenuToggle}>Add Expense</button>
                    </div>
                </div>
            </nav>
            {isMenuOpen && <TransactionMenu onClose={closeMenu} />}
            {(isMenuOpen || isCMenuOpen) && <Backdrop onClose={closeMenu} />}
            {isCMenuOpen && <CategoryMenu onClose={closeMenu} />}
        </header>
    )
}