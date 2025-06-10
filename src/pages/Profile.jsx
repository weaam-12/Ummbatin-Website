import React, { useEffect, useState } from "react";
import { fetchUserProfile } from "../api";
import { useAuth } from "../AuthContext";
// import '../components/styles/Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const { user, loading } = useAuth();

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
                    {/* Add more profile fields as needed */}
                </div>
            )}
        </div>
    );
};

export default Profile;