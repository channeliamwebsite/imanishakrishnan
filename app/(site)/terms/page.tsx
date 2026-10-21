import { termsPage } from "@/lib/content/legal";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const generateMetadata = () => legalMetadata(termsPage);

export default function TermsPage() {
  return <LegalPage page={termsPage} />;
}
