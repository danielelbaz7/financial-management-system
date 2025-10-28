import "./index.css"
import "./dashboard-backdrop.css"

interface BackdropProps {
    onClose: () => void;
}

export default function Backdrop({ onClose }: BackdropProps) {
    return (
        <div className="backdrop" onClick={onClose}></div>
    )
}