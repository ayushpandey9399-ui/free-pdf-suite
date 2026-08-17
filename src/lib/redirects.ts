/**
 * Domain redirection utility.
 * Handles 301-equivalent logic for domain migration.
 */
export function handleDomainRedirect(url: string) {
  const oldDomain = "freepdfhub.in";
  const newDomain = "pdftoolconverteronline.com";
  
  if (url.includes(oldDomain)) {
    return url.replace(oldDomain, newDomain);
  }
  return null;
}
