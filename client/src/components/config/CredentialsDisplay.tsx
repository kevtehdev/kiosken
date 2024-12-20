import React, { useState } from "react";
import { IonIcon, IonButton, IonToast } from "@ionic/react";
import { copyOutline, checkmarkOutline } from "ionicons/icons";
import "../../styles/components/config/CredentialsDisplay.css";

export interface OnslipCredentials {
    hawkId: string;
    key: string;
    realm: string;
    journal: string;
}

interface CredentialsDisplayProps {
    credentials: OnslipCredentials;
}

const CredentialsDisplay: React.FC<CredentialsDisplayProps> = ({
    credentials,
}) => {
    const [showToast, setShowToast] = useState(false);
    const [copiedField, setCopiedField] = useState<string>("");

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setShowToast(true);
    };

    const formatEnvVariable = (name: string, value: string) => {
        return `${name}=${value}`;
    };

    return (
        <div className="credentials-container">
            <h4 className="credentials-title">Nya OAuth-uppgifter</h4>
            <p className="credentials-description">
                Kopiera dessa värden till din .env-fil för att slutföra
                integrationen:
            </p>

            <div className="credentials-list">
                {[
                    { label: "ONSLIP_HAWK_ID", value: credentials.hawkId },
                    { label: "ONSLIP_KEY", value: btoa(credentials.key) },
                    { label: "ONSLIP_REALM", value: credentials.realm },
                    { label: "ONSLIP_JOURNAL", value: credentials.journal },
                ].map(({ label, value }) => (
                    <div key={label} className="credential-item">
                        <div className="credential-header">
                            <span className="credential-label">{label}</span>
                            <IonButton
                                fill="clear"
                                size="small"
                                onClick={() =>
                                    copyToClipboard(
                                        formatEnvVariable(label, value),
                                        label
                                    )
                                }
                            >
                                <IonIcon
                                    icon={
                                        copiedField === label
                                            ? checkmarkOutline
                                            : copyOutline
                                    }
                                />
                            </IonButton>
                        </div>
                        <code className="credential-value">{value}</code>
                    </div>
                ))}
            </div>

            <div className="credentials-warning">
                <p>
                    ⚠️ Kom ihåg att starta om servern efter att du uppdaterat
                    .env-filen!
                </p>
            </div>

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={`${copiedField} kopierad!`}
                duration={2000}
                position="bottom"
                color="success"
            />
        </div>
    );
};

export default CredentialsDisplay;
