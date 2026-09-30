import InfoPage from "@/components/InfoPage";
import PageParagraphs from "@/components/PageParagraphs";
import { getSitePage } from "@/lib/db";
import { DEFAULT_SITE_PAGES } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export const metadata = { title: "About Us — Thundra International" };

export default async function AboutPage() {
  const page = await getSitePage("about");
  const title = page.title || DEFAULT_SITE_PAGES.about.title;

  return (
    <InfoPage title={title}>
      <PageParagraphs content={page.content} />
    </InfoPage>
  );
}
