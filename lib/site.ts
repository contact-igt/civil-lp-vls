function approvedOrigin(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password) return url.origin;
  } catch {}
}

export const siteUrl = approvedOrigin(process.env.CIVIL_SITE_URL);
export const indexable = process.env.CIVIL_ALLOW_INDEXING === 'true' && Boolean(siteUrl);
