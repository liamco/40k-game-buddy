import React, { Fragment } from "react";
import { NavLink } from "react-router-dom";

import BaseIcon from "../../../app_old/components/icons/BaseIcon";
import { buttonClasses } from "../../../app/components/_ui/button";

import styles from "./SidebarNavigation.module.css";
import IconCrossedSwords from "../../../app_old/components/icons/IconCrossedSwords";

const SidebarNavigation = () => {
    return (
        <Fragment>
            <NavLink to="/" end className={`${styles.SidebarNavigation} ${({ isActive }) => (isActive ? buttonClasses.secondary : buttonClasses.ghost)}`}>
                <BaseIcon>
                    <IconCrossedSwords />
                </BaseIcon>
            </NavLink>
            <NavLink to="/lists" className={`${styles.SidebarNavigation} ${({ isActive }) => (isActive ? buttonClasses.secondary : buttonClasses.ghost)}`}>
                <BaseIcon>
                    <IconCrossedSwords />
                </BaseIcon>
            </NavLink>
            <NavLink to="/lists" className={`${styles.SidebarNavigation} ${({ isActive }) => (isActive ? buttonClasses.secondary : buttonClasses.ghost)}`}>
                <BaseIcon>
                    <IconCrossedSwords />
                </BaseIcon>
            </NavLink>
        </Fragment>
    );
};

export default SidebarNavigation;
