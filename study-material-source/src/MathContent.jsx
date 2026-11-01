import React, { useEffect, useRef } from "react";
import { renderMarkdown } from "./content.js";
import { typesetMath } from "./mathJax.js";

export default function MathContent({ value, className = "answer-content", query = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    let active = true;
    const root = ref.current;
    const update = () => typesetMath(root, () => active);
    window.addEventListener("mathjax-ready", update);
    update();
    return () => {
      active = false;
      window.removeEventListener("mathjax-ready", update);
      window.MathJax?.typesetClear?.([root]);
    };
  }, [value, query]);
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: renderMarkdown(value, false, query) }} />;
}
