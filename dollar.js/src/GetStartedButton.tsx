type Props = {
    onClick: () => void
}

//brings user to sign in/sign up page (that is what is stored in onclick)
export default function GetStartedButton({ onClick }: Props) {
    return (
        <div>
            <button className="text-[28px] bg-black text-white hover:bg-[#1e262b] duration-300 rounded-lg px-2 py-1 transition font-semibold hover:cursor-pointer text-48" onClick={onClick}>
                Get Started →
            </button>
        </div>
    )
}