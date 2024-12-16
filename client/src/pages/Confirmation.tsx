import { IonContent, IonPage } from "@ionic/react";
import { Header } from "../components";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ConfirmationPage() {
    const [status, setStatus] = useState("");

    const searchParams = new URLSearchParams(window.location.search);

    // Get a specific parameter
    const transactionID = searchParams.get("t");
    const orderID = searchParams.get("s");
    const eventID = searchParams.get("eventId");

    useEffect(() => {
        async function verify() {
            const res = await api.verifyPayment(transactionID!, orderID!);
            console.log("RESULT", res);
            setStatus(res.statusId);
        }
        verify();
    }, []);

    return (
        <IonPage>
            <Header />
            <IonContent>
                <p>Transaction: {transactionID}</p>
                <p>Order: {orderID}</p>
                <p>Event: {eventID}</p>
                <pre>{JSON.stringify(status)}</pre>
            </IonContent>
        </IonPage>
    );
}
