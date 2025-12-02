//simple styling for the landing page, with ids labeling each section to allow nav buttons to go to the correct sections
export default function Body() {
    return(
        <div>
            <div id="home" className="scroll-mt-24 text-black pt-40 text-6xl text-left font-bold max-w-lg">
                For Students, By Students
            </div>
            <div className="text-black pt-6 text-2xl text-left font-semibold max-w-md">
                Dollar.js is a student-oriented, intuitive, and feature-packed budgeting application.
                <div className="text-black pt-6 text-2xl text-left font-semibold max-w-md">
                    We were tired of other budgeting apps that didn't offer what we needed - so we built our own.
                </div>
            </div>

            <div id="features" className="scroll-mt-24 text-black pt-18 text-6xl text-center font-bold">
                Features
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="border-3 border-black rounded-xl bg-white pt-4 pb-4">
                    <div className="text-black font-semibold text-xl">
                        Custom Expense Categories
                    </div>
                    <div className="text-black text-xl pt-4 px-4">
                        Categorize your spending in any way you want! You can use our premade categories
                        like food and rent, or create your own!
                    </div>
                </div>

                <div className="border-3 border-black rounded-xl bg-white pt-4 pb-4">
                    <div className="text-black font-semibold text-xl">
                        AI Suggestions
                    </div>
                    <div className="text-black text-xl pt-4 px-4">
                        Utilize our custom AI-powered budgeting suggestions to obtain personalized insight on all areas of your finances.
                    </div>
                </div>

                <div className="border-3 border-black rounded-xl bg-white pt-4 pb-4">
                    <div className="text-black font-semibold text-xl">
                        Personalized Budgeting
                    </div>
                    <div className="text-black text-xl pt-4 px-4">
                        Dollar.js allows you to set a custom budget, both categorically and universally, allowing you to master your money.
                    </div>
                </div>
            </div>

            <div id="about" className="scroll-mt-24 text-black pt-24 text-6xl text-center font-bold">
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