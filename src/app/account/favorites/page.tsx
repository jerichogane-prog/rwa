import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { ComingSoon } from '@/components/account/ComingSoon';

export default function FavoritesPage() {
  return (
    <AccountShell title="Favorites" description="Listings you've saved to come back to.">
      <AccountSection title="Saved listings">
        <ComingSoon
          eyebrow="Coming next"
          title="Save listings to revisit"
          body="A heart icon on every listing card and detail page lets you save what you like. Your saved ads will live here, with quick links and price-change indicators."
        />
      </AccountSection>
    </AccountShell>
  );
}
