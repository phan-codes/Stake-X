import { Link, type LinkProps } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * A Link component that redirects logged-in users to /dashboard
 * instead of /login or /register pages.
 */
export default function AuthAwareLink(props: LinkProps & React.RefAttributes<HTMLAnchorElement>) {
  const { user } = useAuth();
  const to = user ? '/dashboard' : props.to;

  return <Link {...props} to={to} />;
}
