import { redirect } from 'next/navigation';

export default function HomePage() {
  // Sempre redireciona para login - o middleware handle auth check
  redirect('/login');
}
