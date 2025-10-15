import "./index.css"

export default function Header() {
    return(
        <div>
            <header className="fixed top-0 left-0 w-full bg-black flex items-center justify-between px-12 py-8 z-50 text-3xl">
                <h1 className="text-white font-bold">Dollar.js</h1>
                <ul className="flex space-x-8 text-white font-medium justify-center translate-x-1/14">
                    <li><a href="#home" className="hover:text-blue-300 transition">Home</a></li>
                    <li><a href="#tools" className="hover:text-blue-300 transition">Tools</a></li>
                    <li><a href="#about" className="hover:text-blue-300 transition">About</a></li>
                </ul>
                <button href="#get-started" className="hover:text-blue-300 transition">Get Started</button>
            </header>

            <div className="text-black pt-40 text-6xl text-left font-bold max-w-lg">
                For Students, By Students
            </div>
            <div className="text-black pt-6 text-2xl text-left font-semibold max-w-md">
                Dollar.js is a student-oriented, intuitive, and feature-packed budgeting application.
                <div className="text-black pt-6 text-2xl text-left font-semibold max-w-md">
                    We were tired of other budgeting apps that didn't offer what we needed - so we built our own.
                </div>
            </div>

            <div className="text-black pt-24 text-6xl text-center font-bold">
                Tools
            </div>

            <div className="text-black pt-24 text-6xl text-center font-bold">
                About Us
            </div>

            <div className="text-black pt-6 text-xl text-center font-semibold max-w-xl mx-auto">
                As students, we searched endlessly for a finance tracker built specifically for people like us.
                When we were unable to find what we were looking for, we decided to create our own. A finance tracker that features
                fast and easy expense and income tracking, financial visualizations, personalized budgeting suggestions, and much more, all for students.
            </div>

        </div>
    )
}