import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import { Header } from "../components";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import "../styles/pages/Confirmation.css";

export default function ConfirmationPage() {
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const searchParams = new URLSearchParams(window.location.search);
    const transactionID = searchParams.get("t");
    const orderID = searchParams.get("s");
    const eventID = searchParams.get("eventId");

    useEffect(() => {
        async function verify() {
            try {
                const res = await api.verifyPayment(transactionID!);
                setStatus(res.statusId);
            } catch (err) {
                console.error("Error verifying payment:", err);
                setError("Failed to verify payment. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        verify();
    }, [transactionID]);

    return (
        <IonPage>
            <Header />
            <IonContent className="confirmation-page">
                <div className="confirmation-container">
                    <h1 className="confirmation-title">Order Confirmation</h1>

                    {loading ? (
                        <div className="loading-spinner">
                            <IonSpinner name="crescent" />
                        </div>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : status === "F" ? (
                        <div className="success-message">
                            <p className="success-title">
                                🎉 Payment Successful!
                            </p>
                            <p>Your order has been confirmed.</p>
                        </div>
                    ) : (
                        <div className="pending-message">
                            <p className="pending-title">⏳ Payment Pending</p>
                            <p>
                                We're processing your payment. Please check back
                                later.
                            </p>
                        </div>
                    )}

                    <div className="details-section">
                        <p>
                            <strong>Transaction ID:</strong>{" "}
                            {transactionID || "N/A"}
                        </p>
                        <p>
                            <strong>Order ID:</strong> {orderID || "N/A"}
                        </p>
                        <p>
                            <strong>Event ID:</strong> {eventID || "N/A"}
                        </p>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}