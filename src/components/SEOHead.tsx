import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'StakeX';
const DEFAULT_DESCRIPTION =
  'StakeX is a digital platform for cryptocurrency services, forex trading, CFD trading, binary options, futures, and cloud mining. Secure operations, clear account management, and dependable tools for both new and experienced users.';
const BASE_URL = 'https://stakex.finance';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

interface SEOHeadProps {
  /** Page-specific title. Will be suffixed with " | StakeX" automatically.
   *  Pass `null` to use the full default homepage title. */
  title?: string | null;
  /** Meta description for this page. */
  description?: string;
  /** Path for this page, e.g. "/login". Used for canonical URL. */
  path?: string;
  /** If true, adds noindex/nofollow meta (for protected/admin pages). */
  noIndex?: boolean;
  /** Override the default OG image URL. */
  ogImage?: string;
  /** og:type override (default: "website"). */
  ogType?: string;
}

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  noIndex = false,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
}: SEOHeadProps) {
  const fullTitle =
    title === null || title === undefined
      ? `${SITE_NAME} — Digital Finance Cloud Solution`
      : `${title} | ${SITE_NAME}`;

  const canonicalUrl = `${BASE_URL}${path}`;

  // Imperatively set the tab title for instant updates on SPA navigation
  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
