export function getHomePath(role) {
  return role === 'owner' ? '/dashboard' : '/';
}

export function getPostLoginPath(role, from) {
  if (from && (from !== '/dashboard' || role === 'owner')) {
    return from;
  }

  return getHomePath(role);
}
