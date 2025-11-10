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
        <div className="flex bg-white rounded-lg shadow-md overflow-hidden max-w-3/3 h-32"
             style={{padding: "1rem"}}>
            {/* Image container */}
            <div className="w-1/3 relative">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Content container */}
            <div className="w-2/3 p-6">

                <h2 className="mt-2 text-xl font-bold text-gray-900">
                    {isLoading ? "Cargando..." : title}
                </h2>

                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                    {category}
                </p>

            </div>
        </div>
    );
};

