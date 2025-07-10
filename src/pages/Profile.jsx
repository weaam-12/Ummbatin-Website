import React, { useEffect, useState } from "react";
import { fetchUserProfile } from "../api";
import { useAuth } from "../AuthContext";
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const { user, loading, logout } = useAuth(); // ← أضفنا logout

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await fetchUserProfile();
                setProfile(data);
            } catch (err) {
                setError("Failed to load profile. Please try again.");
                console.error("Profile error:", err);
            }
        };

        if (user) {
            loadProfile();
        }
    }, [user]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="profile-container">
            <h1>User Profile</h1>

            {error && <div className="error-message">{error}</div>}

            {profile && (
                <div className="profile-details">
                    <div className="profile-field">
                        <span className="field-label">Name:</span>
                        <span className="field-value">{profile.name || 'Not specified'}</span>
                    </div>
                    <div className="profile-field">
                        <span className="field-label">Email:</span>
                        <span className="field-value">{profile.email}</span>
                    </div>

                    {/* ➕ أزرار تحكم */}
                    <div className="profile-actions">
                        <button
                            onClick={logout}
                            className="logout-button"
                            style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                            تسجيل خروج
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
