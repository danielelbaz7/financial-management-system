import "./index.css"
import "./dashboard.css"

export default function Dashboard() {
    return(
        <div>
            <div id="budget">
                <div className="card1 budget-card">
                    <p className="category-label">Total Budget</p>
                    <p className="amount">$0.00</p>
                </div>
                <div className="card1 spent-card">
                    <p className="category-label">Total Spent</p>
                    <p className="amount">$0.00</p>
                </div>
                <div className="card1 remaining-card">
                    <p className="category-label">Total Remaining</p>
                    <p className="amount">$0.00</p>
                </div>
            </div>
            <div id="categories">
                <div className="category-card">Rent</div>
                <div className="category-card">Food</div>
                <div className="category-card">Entertainment</div>
            </div>
        </div>
    )
}