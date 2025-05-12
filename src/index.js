// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <PayPalScriptProvider options={{ "client-id": import.meta.env.REACT_APP_PAYPAL_CLIENT_ID }}>
        <script src="https://www.paypal.com/sdk/js?client-id="></script>

        <App />
    </PayPalScriptProvider>
);
