import { redirect } from 'next/navigation';

// Reports now live under the profile, which is where people look for them. The old route
// stays so existing links and the PDF confirmation screen keep working.
export default function ReportsPage() {
  redirect('/app/profile?view=reports');
}
