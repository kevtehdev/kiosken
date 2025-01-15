import { IonContent, IonPage, IonSpinner, IonIcon, IonButton } from "@ionic/react";
import { checkmarkCircleOutline, hourglassOutline, alertCircleOutline, homeOutline } from "ionicons/icons";
import { Header } from "../components";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
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
            if (!transactionID) {
                setError("Ingen transaktion hittades");
                setLoading(false);
                return;
            }

            try {
                const res = await api.verifyPayment(transactionID);
                setStatus(res.statusId);
            } catch (err) {
                console.error("Error verifying payment:", err);
                setError("Det gick inte att verifiera betalningen. Försök igen senare.");
            } finally {
                setLoading(false);
            }
        }
        verify();
    }, [transactionID]);

    const renderContent = () => {
        if (loading) {
            return (
                <motion.div 
                    className="confirmation-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <IonSpinner name="crescent" />
                    <p>Verifierar din betalning...</p>
                </motion.div>
            );
        }

        if (error) {
            return (
                <motion.div 
                    className="confirmation-state error"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <IonIcon icon={alertCircleOutline} className="state-icon" />
                    <h2>Ett fel uppstod</h2>
                    <p>{error}</p>
                </motion.div>
            );
        }

        if (status === "F") {
            return (
                <motion.div 
                    className="confirmation-state success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <IonIcon icon={checkmarkCircleOutline} className="state-icon" />
                    <h2>Betalning genomförd!</h2>
                    <p>Din order är bekräftad och levereras inom kort.</p>
                </motion.div>
            );
        }

        return (
            <motion.div 
                className="confirmation-state pending"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <IonIcon icon={hourglassOutline} className="state-icon" />
                <h2>Betalning behandlas</h2>
                <p>Vi processerar din betalning. Vänligen vänta.</p>
            </motion.div>
        );
    };

    return (
        <IonPage>
            <Header />
            <IonContent>
                <div className="confirmation-container">
                    <div className="confirmation-card">
                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>

                        <motion.div 
                            className="details-section"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="details-grid">
                                <div className="details-item">
                                    <span className="details-label">Transaktions-ID</span>
                                    <span className="details-value">{transactionID || "—"}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">Order-ID</span>
                                    <span className="details-value">{orderID || "—"}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-label">Händelse-ID</span>
                                    <span className="details-value">{eventID || "—"}</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="confirmation-actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                        </motion.div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}