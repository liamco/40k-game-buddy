import React, { Fragment } from "react";
import { NavLink } from "react-router-dom";

import styles from "./SidebarNavigation.module.css";

const SidebarNavigation = () => {
    return (
        <nav className={styles.SidebarNavigation}>
            <NavLink to="/lists" className={({ isActive }) => `${styles.SidebarNavigationItem} ${isActive ? styles.SidebarNavigationItemActive : ""}`}>
                <span className="text-blockcaps-xs">Rosters</span>
            </NavLink>
            <NavLink to="/engagements" className={({ isActive }) => `${styles.SidebarNavigationItem} ${isActive ? styles.SidebarNavigationItemActive : ""}`}>
                <span className="text-blockcaps-xs">Engagements</span>
            </NavLink>
        </nav>
    );
};

export default SidebarNavigation;
