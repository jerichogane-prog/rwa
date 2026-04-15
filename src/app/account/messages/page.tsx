import { AccountShell, AccountSection } from '@/components/account/AccountShell';
import { ComingSoon } from '@/components/account/ComingSoon';

export default function MessagesPage() {
  return (
    <AccountShell title="Messages" description="Inquiries from buyers about your listings.">
      <AccountSection title="Buyer inquiries">
        <ComingSoon
          eyebrow="Coming next"
          title="Buyer messages, in one place"
          body="We're wiring this up next: every Contact Seller submission on your listings will land here, threaded by buyer, with reply support. For now you'll continue to receive these by email."
        />
      </AccountSection>
    </AccountShell>
  );
}
