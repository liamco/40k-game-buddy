import React, { Fragment } from "react";
import { NavLink } from "react-router-dom";

import styles from "./SidebarNavigation.module.css";

import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconCrossedSwords from "#components/icons/IconCrossedSwords.tsx";
import IconList from "#components/icons/IconList.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";

const SidebarNavigation = () => {
    return (
        <div className="flex flex-col">
            <NavLink to="/engagements" className={({ isActive }) => `${styles.SidebarNavigationItem} ${isActive ? styles.SidebarNavigationItemActive : ""}`}>
                <BaseIcon color="inherit">
                    <IconCrossedSwords />
                </BaseIcon>
            </NavLink>
            <NavLink to="/lists" className={({ isActive }) => `${styles.SidebarNavigationItem} ${isActive ? styles.SidebarNavigationItemActive : ""}`}>
                <BaseIcon color="inherit">
                    <IconList />
                </BaseIcon>
            </NavLink>
            <NavLink to="/" end className={({ isActive }) => `${styles.SidebarNavigationItem} mt-6 ${isActive ? styles.SidebarNavigationItemActive : ""}`}>
                <BaseIcon color="inherit">
                    <IconSkull />
                </BaseIcon>
            </NavLink>
        </div>
    );
};

export default SidebarNavigation;
