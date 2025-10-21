import "./index.css"
import GetStartedButton from "./GetStartedButton.tsx";
import LoginManager from "./LoginManager.tsx";
import {useState} from "react";

export default function Header() {
    const [showLogin, setShowLogin] = useState(false)

    if (showLogin) {
        return <LoginManager /> // render new component instead of button
    }

    return(
            <header className="fixed top-0 left-0 w-full bg-white flex items-center justify-between px-12
            py-8 z-50 text-3xl border-b border-gray-300">
                <h1 className="text-black font-extrabold">Dollar.js</h1>
                <ul className="flex space-x-8 text-black font-medium justify-center translate-x-1/14">
                    <li><a href="#home" className="hover:text-neutral-500 transition">Home</a></li>
                    <li><a href="#features" className="hover:text-neutral-500 transition">Features</a></li>
                    <li><a href="#about" className="hover:text-neutral-500 transition">About</a></li>
                </ul>
                <GetStartedButton onClick={() => setShowLogin(true)} />
            </header>
    )
}