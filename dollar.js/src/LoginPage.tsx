import {useState} from "react";
import {supabase} from "./SupabaseClient.tsx";

type Props = {
    onButtonPress: () => void
}

export default function LoginPage({onButtonPress}: Props) {
    const [loginOrSignUp, setLoginOrSignup] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if(!loginOrSignUp) {
                if(password != confirmPassword) {
                    setError("Passwords don't match.");
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })

                if (error) throw error

                setError(
                    "Check your email for the confirmation link! If your email is already registered, you will not receive an email!",
                )
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) throw error

            }

        } catch (error: any) {
            setError(error.message)
        }
    }

    return (
        <div>
            <button
                className="absolute top-4 left-4 text-gray-500 hover:text-black text-xl"
                onClick={onButtonPress}
            >
                ✕
            </button>

            <div className="text-black font-bold text-3xl pt-4 pb-8"> {loginOrSignUp ? "Login" : "Sign Up"} </div>
            <div className="border-3 border-black rounded-xl bg-white pt-6 pb-6  max-w-1/3 mx-auto">

                {!loginOrSignUp && (
                    <>
                        <div className="text-black font-semibold text-left px-8 pb-2 pt-2 "> Full Name</div>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            type="name"
                            placeholder="Enter your first and last name"
                            className="w-7/8 border-black border-2 rounded-lg p-2 text-black focus:outline-none focus:ring-1"/></>
                    )
                }

                <div className="text-black font-semibold text-left px-8 pb-2 pt-2 "> Email Address </div>
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Enter your email address"
                    className="w-7/8 border-black border-2 rounded-lg p-2 text-black focus:outline-none focus:ring-1"
                />

                <div className="text-black font-semibold text-left px-8 pb-2 pt-2 "> Password </div>
                <input
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Create a secure password"
                    className="w-7/8 border-black border-2 rounded-lg p-2 text-black focus:outline-none focus:ring-1"
                />

                {!loginOrSignUp && (
                    <>
                        <div className="text-black font-semibold text-left px-8 pb-2 pt-2 "> Confirm Password </div>
                        <input
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password"
                            placeholder="Confirm your secure password"
                            className="w-7/8 border-black border-2 rounded-lg p-2 text-black focus:outline-none focus:ring-1"
                        /></>
                    )
                }
                <div className="pb-4"></div>

                <button onClick={handleSignIn} className="text-black border-black border-2 rounded-xl p-2 hover:cursor-pointer font-medium pb">{loginOrSignUp ? "Log In" : "Sign Up"}</button>
                {loginOrSignUp ? (
                    <div className="text-black pt-2">Don't have an account yet? <span onClick={() => setLoginOrSignup(!loginOrSignUp)} className="text-blue-800 hover:cursor-pointer"> Sign Up </span> </div>
                ) :
                    <div className="text-black pt-2">Already have an account? <span onClick={() => setLoginOrSignup(!loginOrSignUp)} className="text-blue-800 hover:cursor-pointer"> Log In </span> </div>
                }

            </div>
        </div>
    )
}