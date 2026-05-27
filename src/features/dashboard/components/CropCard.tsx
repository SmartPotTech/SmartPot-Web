import React from 'react';

interface CropCardProps {
    imageSrc: string;
    imageAlt: string;
    category: string;
    title: string;
    isLoading?: boolean;
}

export const CropCard: React.FC<CropCardProps> = ({
                                                      imageSrc,
                                                      imageAlt,
                                                      category,
                                                      title,
                                                      isLoading = false
                                                  }) => {
    return (
        <div
            className="flex items-center bg-white rounded-lg shadow-md p-3 sm:p-5 gap-2 sm:gap-3 hover:shadow-lg transition-shadow duration-200">
            {/* Image container */}
            <div className="bg-green-100 rounded-3xl w-10 h-10 sm:w-15 sm:h-15 flex-shrink-0 flex items-center justify-center">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-7 h-7 sm:w-11 sm:h-11 object-contain"
                />
            </div>

            {/* Content container */}
            <div className="flex flex-col justify-center flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                    {isLoading ? "Cargando..." : title}
                </h2>

                <p className="text-gray-600 mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wide">
                    {category}
                </p>
            </div>
        </div>
    );
};

