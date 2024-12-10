import React, { useState } from 'react';
import useClickOutside from '../hooks/useClickOutside';

type DropdownProps = {
    children: React.ReactNode;
    buttonLabel: string;
}

const Dropdown: React.FC<DropdownProps> = ({ children, buttonLabel }) => {
    const [isOpen, setIsOpen] = useState(false);

    const ref = useClickOutside(() => {
        setIsOpen(false);
    });

    return (
        <div className="relative inline-block text-left z-10">
            <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {buttonLabel}
            </button>

            <div ref={ref}>
                {isOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dropdown;
