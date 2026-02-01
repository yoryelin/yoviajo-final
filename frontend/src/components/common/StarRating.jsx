import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating Component
 * @param {number} rating - Current rating (0-5)
 * @param {boolean} readonly - If true, stars are not interactive
 * @param {function} onChange - Callback when a star is clicked (rating) => void
 * @param {number} size - Size of stars in px
 */
export default function StarRating({ rating = 0, readonly = false, onChange, size = 20 }) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index) => {
        if (!readonly) setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (!readonly) setHoverRating(0);
    };

    const handleClick = (index) => {
        if (!readonly && onChange) onChange(index);
    };

    return (
        <div className="flex gap-1" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((index) => {
                // Determine if star should be filled
                const fill = (hoverRating || rating) >= index;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        className={`transition-colors duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer'
                            }`}
                        disabled={readonly}
                    >
                        <Star
                            size={size}
                            className={`${fill
                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                    : 'fill-transparent text-slate-600'
                                }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}
