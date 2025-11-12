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
        <div className="flex items-center bg-white rounded-lg shadow-md p-3 gap-3 hover:shadow-lg transition-shadow duration-200">
            {/* Image container */}
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Content container */}
            <div className="flex flex-col justify-center flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                    {isLoading ? "Cargando..." : title}
                </h2>

                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    {category}
                </p>
            </div>
        </div>
    );
};

