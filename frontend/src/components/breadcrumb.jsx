// src/components/breadcrumb.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="text-sm text-gray-600 my-2 ml-4">
      <Link to="/" className="text-blue-600 hover:underline">
        Home
      </Link>
      {pathnames.map((value, index) => {
        if (value === "topics") return null; // ⛔️ Skip it entirely

        const to = "/" + pathnames.slice(0, index + 1).join("/");
        return (
          <span key={to}>
            {" / "}
            <Link to={to} className="text-blue-600 hover:underline">
              {decodeURIComponent(value.replace(/_/g, " "))}
            </Link>
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
