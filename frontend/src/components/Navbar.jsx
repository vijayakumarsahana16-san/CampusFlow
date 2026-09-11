import React, { useState } from 'react';

const Header = ({ user, onLogout, onOpenProfile }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Compute initials (e.g., "Sahana Vijayakumar" -> "SV", "Admin" -> "A")
    const getInitials = (name) => {
        if (!name) return 'A';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const displayName = user?.name || 'Admin';
    const avatarText = getInitials(displayName);

    return (
        <header className="header-bar">
            <div className="profile-container">
                {/* Clicking avatar toggles dropdown menu */}
                <button 
                    className="profile-trigger" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <div className="avatar-circle">{avatarText}</div>
                    <span className="user-name">{displayName}</span>
                </button>

                {/* Profile Dropdown Menu */}
                {isMenuOpen && (
                    <div className="profile-dropdown">
                        <button 
                            className="dropdown-item" 
                            onClick={() => {
                                setIsMenuOpen(false);
                                onOpenProfile();
                            }}
                        >
                            <i className="icon-user"></i> View / Edit Profile
                        </button>
                        <hr />
                        <button 
                            className="dropdown-item logout" 
                            onClick={() => {
                                setIsMenuOpen(false);
                                onLogout();
                            }}
                        >
                            <i className="icon-logout"></i> Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;