import { Redirect, Route } from "react-router-dom";
import {
    IonApp,
    IonRouterOutlet,
    IonTabs,
    setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

// Contexts
import { ApiProvider } from "./contexts/apiContext";
import { CustomerProvider } from "./contexts/userContext";
import { CartProvider } from "./contexts/cartContext";
import { FilterProvider } from "./contexts/filterContext";
import { useApi } from "./contexts/apiContext";
import { TabBar } from "./components/layout/TabBar";

// Pages
import Home from "./pages/Home";
import TabPage from "./pages/TabPage";
import Cart from "./pages/Cart";
import Campaign from "./pages/Campaign";
import Config from "./pages/Config";
import ConfirmationPage from "./pages/Confirmation";

// Ionic CSS
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

// Custom CSS
import "./theme/variables.css";
import "./styles/pages/Home.css";
import "./styles/components/products/ProductCard.css";
import "./styles/components/products/CategorySection.css";
import "./styles/components/layout/Header.css";
import "./styles/components/layout/TabBar.css";

setupIonicReact();

const TabsContainer: React.FC = () => {
    const {
        state: { buttonMaps },
    } = useApi();

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/" render={() => <Redirect to="/home" />} />
                <Route exact path="/home" component={Home} />
                <Route exact path="/tabs/:id" component={TabPage} />
                <Route exact path="/cart" component={Cart} />
                <Route exact path="/campaigns" component={Campaign} />
                <Route exact path="/config" component={Config} />
                <Route
                    exact
                    path="/confirmation"
                    component={ConfirmationPage}
                />
            </IonRouterOutlet>
            <TabBar buttonMaps={buttonMaps} />
        </IonTabs>
    );
};

const App: React.FC = () => {
    return (
        <IonApp>
            <ApiProvider>
                <CustomerProvider>
                    <CartProvider>
                        <FilterProvider>
                            <IonReactRouter>
                                <IonRouterOutlet>
                                    <Route
                                        path="/"
                                        render={() => <TabsContainer />}
                                    />
                                </IonRouterOutlet>
                            </IonReactRouter>
                        </FilterProvider>
                    </CartProvider>
                </CustomerProvider>
            </ApiProvider>
        </IonApp>
    );
};

export default App;
