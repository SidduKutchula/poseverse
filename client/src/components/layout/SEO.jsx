import React, { useEffect } from "react";

const SEO = ({ title, description }) => {
  useEffect(() => {
    // Set document title
    document.title = title 
      ? `${title} | PoseVerse` 
      : "PoseVerse — AI-Powered Photography Pose Inspiration Platform";

    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      "content", 
      description || "Discover beautiful photoshoot pose guides for weddings, traditional, maternity, birthday and fashion shoots."
    );

    // Set OpenGraph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", title ? `${title} | PoseVerse` : "PoseVerse");

    // Set OpenGraph Description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute(
      "content", 
      description || "Discover beautiful photoshoot pose guides for weddings, traditional, maternity, birthday and fashion shoots."
    );

  }, [title, description]);

  return null;
};

export default SEO;
