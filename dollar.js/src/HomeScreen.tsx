import Body from "./Body.tsx";
import Header from "./Header";
import {useEffect, useState} from "react";
import LoginManager from "./LoginManager.tsx";

export default function HomeScreen() {
    //pulls from LS whether to show login page or simply show landing page
    const [showLogin, setShowLogin] = useState(() => {
        const stored = localStorage.getItem("showLoginLocalStorage")
        return stored ? JSON.parse(stored) : false
    })

    useEffect(() => {
        localStorage.setItem("showLoginLocalStorage", JSON.stringify(showLogin));
    }, [showLogin]);

    const closeLogin = () => {
        setShowLogin(false)
    }

    if(showLogin) {
        return <LoginManager onButtonPress={closeLogin} />
    }

    return (
        <div>
            <Header onLoginClick={()=> setShowLogin(true)} />
            <Body />
        </div>
    )
}