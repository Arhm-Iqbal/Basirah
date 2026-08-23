import { redirect } from 'next/navigation';

// The public entry point people are given; the form itself lives behind the app shell.
export default function ReportPage() {
  redirect('/app/report');
}
