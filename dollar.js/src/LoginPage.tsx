import {useState} from "react";

export default function LoginPage() {
    const [loginOrSignUp, setLoginOrSignup] = useState(false);

    return (
        <div>
            <button
                className="absolute top-4 left-4 text-gray-500 hover:text-black text-xl"
            >
                ✕
            </button>

            <div className="text-black font-bold text-3xl pt-4 pb-8"> {loginOrSignUp ? "Login" : "Sign Up"} </div>
            <div className="border-3 border-black rounded-xl bg-white pt-6 pb-6 max-w-1/3 mx-auto">

                {!loginOrSignUp && (
                    <>
                        <div className="text-black font-semibold text-left px-8 pb-2 pt-2 "> Full Name</div>
                        <input
                            type="name"
                            placeholder="Enter your first and last name"
                            className="w-7/8 border-black border-2 rounded-lg p-2 text-black focus:outline-none focus:ring-1"/></>
                    )
                }

                <div className="text-black font-semibold text-left px-8 pb-2 pt-2 "> Email Address </div>
                <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-7/8 border-black border-2 rounded-lg p-2 text-black focus:outline-none focus:ring-1"
                />

                <div className="text-black font-semibold text-left px-8 pb-2 pt-2 "> Password </div>
                <input
                    type="password"
                    placeholder="Create a secure password"
                    className="w-7/8 border-black border-2 rounded-lg p-2 text-black focus:outline-none focus:ring-1"
                />

                {!loginOrSignUp && (
                    <>
                        <div className="text-black font-semibold text-left px-8 pb-2 pt-2 "> Confirm Password </div>
                        <input
                            type="password"
                            placeholder="Confirm your secure password"
                            className="w-7/8 border-black border-2 rounded-lg p-2 text-black focus:outline-none focus:ring-1"
                        /></>
                    )
                }
                <div className="pb-4"></div>

                <button className="text-black border-black border-2 rounded-xl p-2 hover:cursor-pointer font-medium ">{loginOrSignUp ? "Log In" : "Sign Up"}</button>

            </div>
        </div>
    )
}