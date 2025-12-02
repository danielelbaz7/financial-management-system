import "./index.css"
import "./dashboard-backdrop.css"

interface BackdropProps {
    onClose: () => void;
}

//dimmed out background when adding transaction for modern ui feel
export default function Backdrop({ onClose }: BackdropProps) {
    return (
        <div className="backdrop" onClick={onClose}></div>
    )
}