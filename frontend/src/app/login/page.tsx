import { Suspense } from 'react';

import LoginForm from './login-form';

export const metadata = { title: 'Log in · Basirah' };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
