import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AuthProvider } from './AuthContext'; import './App.css'
import './pages/i18n';

// تأكد من أن ملفات Bootstrap مستوردة
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'

// استيراد ملفات CSS الإضافية
import './pages/AdminComplaints.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </PayPalScriptProvider>
    </StrictMode>
)
