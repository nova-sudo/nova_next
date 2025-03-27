import Ideation from "../../../../src/main/IdeationPage";

export default function Page({ params }) {
  const { id, title } = params;
  const ideaId = id; // Required id
  const titleSlug = title && title.length > 0 ? title[0] : null; // Optional title

  return <Ideation ideaId={ideaId} />;
}
