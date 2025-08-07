// src/components/dynamic_icon.jsx
import React from "react";
import { FaTools, FaFlask, FaRobot, FaCogs } from "react-icons/fa";

const iconMap = {
    default: FaCogs,
    automation: FaRobot,
    process_improvement: FaTools,
    daq: FaFlask,
};

const DynamicIcon = ({ name, className }) => {
    const IconComponent = iconMap[name] || iconMap["default"];
    return <IconComponent className={className} />;
};

export default DynamicIcon;
