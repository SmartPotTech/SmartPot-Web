import React, {useState} from 'react';
import useClickOutside from '../../hooks/useClickOutside.tsx';

type DropdownProps = {
    children: React.ReactNode;
    buttonLabel: string;
}

const Dropdown: React.FC<DropdownProps> = ({children, buttonLabel}) => {
    const [isOpen, setIsOpen] = useState(false);

    const ref = useClickOutside(() => {
        setIsOpen(false);
    });

    return (
        <div className="relative inline-block text-left z-50">
            <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border bg-gray-100 text-gray-700 border-gray-300 outline-1 outline-offset-0 outline-gray-300 shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {buttonLabel}
            </button>

            <div ref={ref}>
                {isOpen && (
                    <div
                        className="origin-top-left absolute z-50 left-0 mt-2 w-auto max-w-[100vw] overflow-x-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dropdown;
