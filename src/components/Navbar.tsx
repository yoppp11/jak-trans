import { useState } from "react"

export default function Navbar(){
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className="flex justify-center items-center w-full h-12 bg-blue-600">
                <div className="flex justify-between space items-center text-white font-medium w-full max-w-screen-xl px-4 md:px-8 lg:px-12">
                    <div className="text-sm md:text-base lg:text-lg">
                        <span className="font-bold text-2xl">JakTrans</span>
                    </div>
                    <div className="hidden sm:flex flex-row gap-6 items-center text-sm md:text-base">
                        <span>Home</span>
                        <span>About</span>
                        <span>Contact</span>
                    </div>
                </div>

                <div className="sm:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-black focus:outline-none"
                    >
                        <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        {isOpen ? (
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                        </svg>
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden bg-white shadow-md py-4 px-6">
                    <nav className="flex flex-col gap-4 text-black text-sm">
                        <span className="cursor-pointer hover:text-amber-700">Home</span>
                        <span className="cursor-pointer hover:text-amber-700">About</span>
                        <span className="cursor-pointer hover:text-amber-700">Contact</span>
                    </nav>
                </div>
            )}

        </>
    )
}