import { MoreVertical, ChevronLast, ChevronFirst, LogOut } from "lucide-react";
import { useContext, createContext, useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from './TaskContext';
import { useAuth } from '../context/AuthContext';

const SidebarContext = createContext(undefined);

const Sidebar = ({ children, isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && buttonRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setShowDropdown(false);
        }
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowDropdown(false);
    };

    return (
        <aside className="fixed top-0 left-0 h-screen z-50">
            <nav className={`h-full flex flex-col bg-white border-r shadow-sm ${isOpen ? 'w-72' : 'w-20'}`}>
                <div className="p-4 pb-2 flex justify-between items-center">
                    <img
                        src="https://img.logoipsum.com/243.svg"
                        className={`overflow-hidden transition-all duration-300 ${
                            isOpen ? "w-32" : "w-0"
                        }`}
                        alt=""
                    />
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                        {isOpen ? <ChevronFirst/> : <ChevronLast/>}
                    </button>
                </div>

                <SidebarContext.Provider value={{expanded: isOpen}}>
                    <ul className="flex-1 px-3 overflow-y-auto scrollbar-hide">{children}</ul>
                </SidebarContext.Provider>

                <div className="border-t p-3">
                    <div className="flex items-center gap-3">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.surname}&background=c7d2fe&color=3730a3&bold=true`}
                            alt=""
                            className="w-10 h-10 rounded-md"
                        />
                        {isOpen && (
                            <>
                                <div className="flex-1">
                                    <h4 className="font-semibold">{user?.name} {user?.surname}</h4>
                                    <span className="text-xs text-gray-600">{user?.email}</span>
                                </div>
                                <div className="relative">
                                    <button
                                        ref={buttonRef}
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none"
                                    >
                                        <MoreVertical size={20}/>
                                    </button>

                                    {showDropdown && (
                                        <div
                                            ref={dropdownRef}
                                            className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border py-1"
                                        >
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <LogOut size={16}/>
                                                <span>Log out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </aside>
    );
};

export function SidebarItem({ icon, text, active, alert, link }) {
    const { expanded } = useContext(SidebarContext);
    const navigate = useNavigate();
    const { openTaskModal } = useTaskContext();

    const handleClick = () => {
        if (text === "New Task") {
            openTaskModal();
        } else {
            navigate(link);
        }
    };

    return (
        <li
            onClick={handleClick}
            className={`
                relative flex items-center py-2 px-3 my-1
                font-medium rounded-md cursor-pointer
                transition-colors group
                duration-300 ${active ? "bg-indigo-200" : "hover:bg-indigo-50 text-gray-600"}
                ${!expanded && "justify-center"}
            `}
        >
            {icon}
            <span
                className={`overflow-hidden transition-all duration-300 ${expanded ? "w-52 ml-3" : "w-0"}`}
            >
                {text}
            </span>
            {alert && <div className="absolute right-2 w-2 h-2 rounded bg-indigo-400" />}

        </li>
    );
}

export default Sidebar;