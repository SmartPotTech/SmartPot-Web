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
        <div className="flex items-center bg-white text-lg rounded-lg shadow-md p-5 gap-3 hover:shadow-lg transition-shadow duration-200">
            {/* Image container */}
            <div className="bg-green-100 rounded-3xl w-15 h-15 flex-shrink-0 flex items-center justify-center">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-11 h-11 object-contain"
                />
            </div>

            {/* Content container */}
            <div className="flex flex-col justify-center flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                    {isLoading ? "Cargando..." : title}
                </h2>

                <p className="text-gray-600 mt-2 text-sm font-semibold uppercase tracking-wide">
                    {category}
                </p>
            </div>
        </div>
    );
};

