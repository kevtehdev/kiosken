import { Redirect, Route } from "react-router-dom";
import {
    IonApp,
    IonRouterOutlet,
    IonTabs,
    setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { ApiProvider } from "./contexts/apiContext";
import { CustomerProvider } from "./contexts/userContext";
import { CartProvider } from "./contexts/cartContext";
import { useApi } from "./contexts/apiContext";
import { TabBar } from "./components/layout/TabBar";

// CSS imports
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";

// Page imports
import Home from "./pages/Home";
import TabPage from "./pages/TabPage";
import Cart from "./pages/Cart";
import Campaign from "./pages/Campaign";

setupIonicReact();

const TabsContainer: React.FC = () => {
    const { state: { buttonMaps } } = useApi();

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/" render={() => <Redirect to="/home" />} />
                <Route exact path="/home" component={Home} />
                <Route exact path="/tabs/:id" component={TabPage} />
                <Route exact path="/cart" component={Cart} />
                <Route exact path="/campaigns" component={Campaign} />
            </IonRouterOutlet>
            <TabBar buttonMaps={buttonMaps} />
        </IonTabs>
    );
};

const App: React.FC = () => {
    return (
        <IonApp>
            <CartProvider>
                <ApiProvider>
                    <CustomerProvider>
                        <IonReactRouter>
                            <TabsContainer />
                        </IonReactRouter>
                    </CustomerProvider>
                </ApiProvider>
            </CartProvider>
        </IonApp>
    );
};

export default App;