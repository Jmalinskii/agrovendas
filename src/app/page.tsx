import { verifySession } from '@/lib/dal';
import { redirect } from 'next/navigation';

export default async function Home() {
  // O Proxy intercepta a raiz, mas como garantia fazemos o redirecionamento aqui também
  const session = await verifySession();

  if (session.isAuth) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
