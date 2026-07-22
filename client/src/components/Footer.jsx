import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const location = useLocation().pathname;
  const currectYear = new Date().getFullYear();
  const navigate = useNavigate();

  if (location.toLocaleLowerCase().includes("dashborad")) return null;

  return (
    <>
      <div>Footer</div>
    </>
  );
};

export default Footer;
