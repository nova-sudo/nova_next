// // src/components/ShareSocial/ExportToGoogleDocs.jsx
// import React, { useEffect, useState } from "react";
// import { gapi } from "gapi-script";
// import Image from "next/image";

// const CLIENT_ID = "YOUR_CLIENT_ID";
// const API_KEY = "YOUR_API_KEY";
// const SCOPES = "https://www.googleapis.com/auth/documents";

// const ExportGoogleDocs = ({ ideaFieldsData }) => {
//   const [gapiLoaded, setGapiLoaded] = useState(false);

//   useEffect(() => {
//     function start() {
//       gapi.client
//         .init({
//           apiKey: API_KEY,
//           clientId: CLIENT_ID,
//           discoveryDocs: [
//             "https://docs.googleapis.com/$discovery/rest?version=v1",
//           ],
//           scope: SCOPES,
//         })
//         .then(() => {
//           setGapiLoaded(true);
//         });
//     }
//     gapi.load("client:auth2", start);
//   }, []);

//   const handleExport = () => {
//     if (!gapiLoaded) {
//       console.error("GAPI client not loaded yet.");
//       return;
//     }

//     gapi.auth2
//       .getAuthInstance()
//       .signIn()
//       .then(() => {
//         const docContent = [
//           { text: `ID: ${ideaFieldsData.idea_id}`, bold: true },
//           { text: `Last Modified: ${ideaFieldsData.last_modified}` },
//           { text: `Title: ${ideaFieldsData.current_title}` },
//           { text: `Summary: ${ideaFieldsData.current_summary}` },
//           { text: `Literature: ${ideaFieldsData.current_lit}` },
//         ];

//         gapi.client.docs.documents
//           .create({
//             resource: {
//               title: ideaFieldsData.current_title,
//               body: {
//                 content: docContent.map((line) => ({
//                   paragraph: {
//                     elements: [
//                       {
//                         textRun: {
//                           content: line.text + "\n",
//                           textStyle: {
//                             bold: line.bold || false,
//                           },
//                         },
//                       },
//                     ],
//                   },
//                 })),
//               },
//             },
//           })
//           .then(
//             (response) => {
//               const documentId = response.result.documentId;
//               console.log(`Document created with ID: ${documentId}`);
//               window.open(
//                 `https://docs.google.com/document/d/${documentId}/edit`
//               );
//             },
//             (error) => {
//               console.error("Error creating document: ", error);
//             }
//           );
//       });
//   };

//   return (
//     <button onClick={handleExport}>
//       <Image
//         src="/google-docs-icon.png"
//         alt="Google Docs Icon"
//         style={{ width: "20px", height: "20px", marginRight: "8px" }}
//       />
//       Export to Google Docs
//     </button>
//   );
// };

// export default ExportGoogleDocs;
