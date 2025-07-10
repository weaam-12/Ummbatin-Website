// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { UserProvider } from './UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <PayPalScriptProvider options={{ "client-id": import.meta.env.REACT_APP_PAYPAL_CLIENT_ID }}>
        <script src="https://www.paypal.com/sdk/js?client-id="></script>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </PayPalScriptProvider>
);

