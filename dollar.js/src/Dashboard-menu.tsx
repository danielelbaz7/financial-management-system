import "./index.css"
import "./dashboard-menu.css"

interface BackdropProps {
    onClose: () => void;
}

export default function TransactionMenu({ onClose }: BackdropProps) {
    return (
        <div className="transaction-menu">
            <div className="transaction-header">
                <h3>Add Transaction</h3>
                <button className="close-menu" onClick={onClose}>
                    &times;
                </button>
            </div>
            <form className="transaction-form">
                <div className="form-group">
                    <label>Type</label>
                    <div className="radio-group">
                        <label>
                            <input type="radio"/>
                            Income
                        </label>
                        <label>
                            <input type="radio"/>
                            Expense
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label>Amount ($)</label>
                    <input type="number" placeholder="0.00" className="input-field"/>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input type="text" placeholder="What was this for?" className="input-field"/>
                </div>
                
                <button type="submit" className="add-transaction-button">
                    Add Transaction
                </button>
            </form>
        </div>
    )
}