import "./index.css"
import "./category-menu.css"
import { useState } from 'react'

interface BackdropProps {
    onClose: () => void;
}

export default function CategoryMenu({ onClose }: BackdropProps) {
    
    const [category, setCategory] = useState(null);

    return (
        <div className="c-menu">
            <div className="category-menu-header">
                <h3>Add New Category</h3>
                <button onClick={onClose} style={{cursor: "pointer"}}>
                    &times;
                </button>
            </div>
            <div>
                <label>Name of New Category</label>
                <input value="category" type="text" placeholder="Input Name Here" className="input-field mt-5 mb-5"/>
            </div>
            <button className="w-full flex justify-center cursor-pointer">Confirm Add</button>
        </div>
    )
}