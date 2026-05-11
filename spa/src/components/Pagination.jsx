import React from 'react';

function Pagination({ page, totalPages, onPage }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    for (let i = left; i <= right; i += 1) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            <button
                type="button"
                className="pagination__btn"
                onClick={() => onPage(page - 1)}
                disabled={page === 1}
            >
                ‹
            </button>

            {left > 1 && (
                <>
                    <button
                        type="button"
                        className="pagination__btn"
                        onClick={() => onPage(1)}
                    >
                        1
                    </button>
                    {left > 2 && <span className="pagination__dots">…</span>}
                </>
            )}

            {pages.map((p) => (
                <button
                    key={p}
                    type="button"
                    className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
                    onClick={() => onPage(p)}
                >
                    {p}
                </button>
            ))}

            {right < totalPages && (
                <>
                    {right < totalPages - 1 && (
                        <span className="pagination__dots">…</span>
                    )}
                    <button
                        type="button"
                        className="pagination__btn"
                        onClick={() => onPage(totalPages)}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                type="button"
                className="pagination__btn"
                onClick={() => onPage(page + 1)}
                disabled={page === totalPages}
            >
                ›
            </button>
        </div>
    );
}

export default Pagination;
