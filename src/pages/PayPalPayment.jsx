import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

const PayPalPayment = ({ amount }) => {
    return (
        <PayPalButtons
            createOrder={(data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: amount,
                        },
                    }],
                });
            }}
            onApprove={async (data, actions) => {
                const order = await actions.order.capture();
                console.log("Payment Approved: ", order);
                alert("Payment successful!");
            }}
            onError={(err) => {
                console.error("Error with PayPal Payment: ", err);
                alert("An error occurred with PayPal payment.");
            }}
        />
    );
};

export default PayPalPayment;