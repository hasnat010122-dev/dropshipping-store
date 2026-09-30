import { pageContentToParagraphs } from "@/lib/site-pages";

/** Renders admin-edited page content as paragraphs (blank line = new paragraph). */
export default function PageParagraphs({ content }: { content: string }) {
  const paragraphs = pageContentToParagraphs(content);
  if (paragraphs.length === 0) return null;
  return (
    <>
      {paragraphs.map((text, i) => (
        <p key={i} className={i > 0 ? "mt-4" : undefined}>
          {text}
        </p>
      ))}
    </>
  );
}
