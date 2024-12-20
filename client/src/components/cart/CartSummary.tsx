interface CartSummaryProps {
    total: number;
    totalDiscount: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
    total,
    totalDiscount
}) => (
    <div className="cart-total">
        <div className="cart-total-header">
            <span className="cart-total-label">
                Totalt att betala
            </span>
            <div className="cart-total-container">
                {totalDiscount > 0 && (
                    <span className="cart-total-discount">
                        -{totalDiscount.toFixed(2)} kr
                    </span>
                )}
                <span className="cart-total-amount">
                    {total.toFixed(2)} kr
                </span>
            </div>
        </div>
    </div>
);