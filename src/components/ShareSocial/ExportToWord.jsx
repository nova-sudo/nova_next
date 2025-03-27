import React from "react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
} from "docx";
import { saveAs } from "file-saver";
import Image from "next/image";

const ExportToWord = ({ id, ideaFieldsData }) => {
  const handleExport = () => {
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 20,
              font: "Arial",
            },
            paragraph: {
              spacing: {
                line: 276,
              },
            },
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: ideaFieldsData.current_title,
              heading: HeadingLevel.HEADING_1,
              bold: true,
            }),
            new Paragraph({
              text: `ID: ${ideaFieldsData.idea_id}`,
            }),
            new Paragraph({
              text: `Last Modified: ${ideaFieldsData.last_modified}`,
            }),
            new Paragraph({}),
            new Paragraph({
              text: "Summary:",
              heading: HeadingLevel.HEADING_2,
            }),
            ...formatMarkdown(ideaFieldsData.current_summary),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(
        blob,
        `${ideaFieldsData.current_title.replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g, "")}.docx`,
      );
    });
  };

  const formatMarkdown = (text) => {
    const lines = text.split("\n");
    const formattedParagraphs = [];

    lines.forEach((line) => {
      if (line.startsWith("### ")) {
        formattedParagraphs.push(
          new Paragraph({
            text: line.replace("### ", ""),
          }),
        );
      } else if (line.startsWith("#### ")) {
        formattedParagraphs.push(
          new Paragraph({
            text: line.replace("#### ", ""),
          }),
        );
      } else if (line.match(/^\d+\.\s*\*\*.+\*\*:/)) {
        // Handle numbered list items with bold text and colon
        const match = line.match(/^(\d+)\.\s*(\*\*.+\*\*:)(.*)$/);
        if (match) {
          const [, number, boldPart, restOfLine] = match;
          formattedParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${number}. ` }),
                new TextRun({
                  text: boldPart.replace(/^\*\*|\*\*:$/g, ""),
                }),
                new TextRun({ text: ":" }),
                new TextRun({ text: restOfLine }),
              ],
            }),
          );
        }
      } else if (
        line.match(/^●\s-\s/) ||
        line.match(/^ {3}-\s/) ||
        line.match(/^-\s/)
      ) {
        // Handle bullet points
        const bulletText = line.replace(/^(●\s-\s| {3}-\s|-\s)/, "");
        const parts = bulletText.split(/(\*\*.*?\*\*)/);

        formattedParagraphs.push(
          new Paragraph({
            bullet: {
              level: 0,
            },
            children: parts.map((part) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return new TextRun({
                  text: part.replace(/^\*\*|\*\*$/g, ""),
                });
              } else {
                return new TextRun({
                  text: part,
                });
              }
            }),
          }),
        );
      } else if (
        line.includes("[[") &&
        line.includes("](") &&
        line.includes(")]")
      ) {
        // Handle citations with links [[citation number](citation url)]
        let currentText = "";
        const children = [];
        let inCitation = false;
        let citationNumber = "";
        let citationUrl = "";

        for (let i = 0; i < line.length; i++) {
          if (line[i] === "[" && line[i + 1] === "[") {
            if (currentText) {
              children.push(new TextRun({ text: currentText }));
              currentText = "";
            }
            inCitation = true;
            i++; // Skip the next '['
          } else if (inCitation && line[i] === "]" && line[i + 1] === "(") {
            citationNumber = currentText;
            currentText = "";
            i++; // Skip the '('
          } else if (inCitation && line[i] === ")" && line[i + 1] === "]") {
            citationUrl = currentText;
            children.push(
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: `[${citationNumber}]`,
                    style: "Hyperlink",
                  }),
                ],
                link: citationUrl,
              }),
            );
            currentText = "";
            inCitation = false;
            citationNumber = "";
            citationUrl = "";
            i++; // Skip the next ']'
          } else {
            currentText += line[i];
          }
        }

        if (currentText) {
          children.push(new TextRun({ text: currentText }));
        }

        formattedParagraphs.push(new Paragraph({ children }));
      } else {
        // Handle regular text with potential bold or italic formatting
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/);
        formattedParagraphs.push(
          new Paragraph({
            children: parts.map((part) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return new TextRun({
                  text: part.replace(/^\*\*|\*\*$/g, ""),
                });
              } else if (part.startsWith("*") && part.endsWith("*")) {
                return new TextRun({
                  text: part.replace(/^\*|\*$/g, ""),
                });
              } else {
                return new TextRun({
                  text: part,
                });
              }
            }),
          }),
        );
      }
    });

    return formattedParagraphs;
  };

  return (
    <button
      id={id}
      className="flex flex-col items-center mx-2"
      onClick={handleExport}
    >
      <div className="bg-red-100 p-4 rounded-full flex items-center justify-center w-16 h-16">
        <Image
          src="/word-icon.png"
          alt="Word Icon"
          style={{ width: "20px", height: "20px", marginRight: "8px" }}
        />
      </div>
      <span className="mt-2 text-sm text-center">
        Export to
        <br />
        MS Word
      </span>
    </button>
  );
};

export default ExportToWord;
