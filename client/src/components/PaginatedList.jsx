import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginatedList = ({ items, itemsPerPage = 10, renderItem, layout = "vertical" }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div>
            <div className={`${layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"} mb-4`}>
                {currentItems.map(renderItem)}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 px-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => goToPage(index + 1)}
                                className={`w-10 h-10 rounded-lg ${
                                    currentPage === index + 1
                                        ? 'bg-[#6D70E0] text-white'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-sm text-gray-500">
                        Showing {startIndex + 1}-{Math.min(endIndex, items.length)} of {items.length}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaginatedList;