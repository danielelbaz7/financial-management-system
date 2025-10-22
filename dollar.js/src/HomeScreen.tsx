import Body from "./Body.tsx";
import Header from "./Header";
import {useEffect, useState} from "react";
import LoginManager from "./LoginManager.tsx";

export default function HomeScreen() {
    const [showLogin, setShowLogin] = useState(() => {
        const stored = localStorage.getItem("showLoginLocalStorage")
        return stored ? JSON.parse(stored) : false
    })

    useEffect(() => {
        localStorage.setItem("showLoginLocalStorage", JSON.stringify(showLogin));
    }, [showLogin]);

    if(showLogin) {
        return <LoginManager />
    }

    return (
        <div>
            <Header onLoginClick={()=> setShowLogin(true)} />
            <Body />
        </div>
    )
}