# 301 Redirects from old domain
# Note: This is a placeholder for server-level configuration (e.g., Vercel/Cloudflare redirects).
# In TanStack Start, we handle this in a root loader or middleware if running on the old domain.

export function handleDomainRedirect(url: string) {
  const oldDomain = "freepdfhub.in";
  const newDomain = "pdftoolconverteronline.com";
  
  if (url.includes(oldDomain)) {
    return url.replace(oldDomain, newDomain);
  }
  return null;
}
