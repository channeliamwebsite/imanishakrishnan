import { privacyPage } from "@/lib/content/legal";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata(privacyPage);

export default function PrivacyPage() {
  return <LegalPage page={privacyPage} />;
}
