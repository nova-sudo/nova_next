// src/components/ShareSocial/ExportToOverleaf.jsx
import React from "react";
import Image from "next/image";

export const ExportToOverleaf = ({ id, ideaFieldsData }) => {
  const latexify = (data) => {
    let prefix = `
\\documentclass{article}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\begin{document}
\\noindent
\\begin{align*}
`;
    let suffix = `
\\end{align*}
\\end{document}
`;
    return (
      prefix +
      `ID: ${data.idea_id}\n` +
      `Last Modified: ${data.last_modified}\n` +
      `Title: ${data.current_title}\n` +
      `Summary: ${data.current_summary}\n` +
      `Literature: ${data.current_lit}\n` +
      suffix
    );
  };

  return (
    <form
      id="overleaf_form"
      action="https://www.overleaf.com/docs"
      method="post"
      target="_blank"
    >
      <button className="flex flex-col items-center mx-2" type="submit" id={id}>
        <div className="bg-red-100 p-4 rounded-full flex items-center justify-center w-16 h-16">
          <textarea
            className="hidden"
            rows="8"
            cols="60"
            name="snip"
            defaultValue={latexify(ideaFieldsData)}
          />
          <Image
            src="/overleaf-icon.png"
            alt="Overleaf Icon"
            style={{ width: "24px", height: "24px" }}
          />
        </div>
        <span className="mt-2 text-sm text-center">
          Export to
          <br />
          Overleaf
        </span>
      </button>
    </form>
  );
};
