import Link from 'next/link';
import { getSession } from '@/lib/session';
import { logoutAction } from '@/actions/auth';
import { Film, Tv, Gamepad2, LogOut, Wand2 } from 'lucide-react';

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        MSV
      </Link>
      
      {session && (
        <div className="navbar-nav">
          <Link href="/animes" className="nav-link"><Wand2 size={18} style={{display:'inline', marginRight:5, verticalAlign:'text-bottom'}} /> Animes</Link>
          <Link href="/games" className="nav-link"><Gamepad2 size={18} style={{display:'inline', marginRight:5, verticalAlign:'text-bottom'}} /> Games</Link>
          <Link href="/movies" className="nav-link"><Film size={18} style={{display:'inline', marginRight:5, verticalAlign:'text-bottom'}} /> Movies</Link>
          <Link href="/series" className="nav-link"><Tv size={18} style={{display:'inline', marginRight:5, verticalAlign:'text-bottom'}} /> Series</Link>
          <form action={logoutAction}>
            <button className="btn btn-danger" type="submit">
              <LogOut size={18} style={{display:'inline', marginRight:5, verticalAlign:'text-bottom'}} /> Logout
            </button>
          </form>
        </div>
      )}
      {!session && (
        <div className="navbar-nav">
          <Link href="/login" className="btn btn-primary">Login</Link>
        </div>
      )}
    </nav>
  );
}
