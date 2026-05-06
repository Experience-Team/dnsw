import type { IconType } from '@icons-pack/react-simple-icons';
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiTiktok,
  SiYoutube,
  SiPinterest,
  SiSnapchat,
  SiTripadvisor,
  SiBookingdotcom,
} from '@icons-pack/react-simple-icons';

// null = known brand but no icon yet — renders a placeholder
// undefined (key missing) = unknown brand — renders nothing
const BRAND_MAP: Record<string, IconType | null> = {
  facebook:         SiFacebook,
  instagram:        SiInstagram,
  x:                SiX,
  twitter:          SiX,
  tiktok:           SiTiktok,
  youtube:          SiYoutube,
  pinterest:        SiPinterest,
  snapchat:         SiSnapchat,
  tripadvisor:      SiTripadvisor,
  'booking.com':    SiBookingdotcom,
  bookingdotcom:    SiBookingdotcom,
  // Placeholders — source SVG and replace null with the component
  linkedin:         null,
  chatgpt:          null,
  openai:           null,
  'lonely planet':  null,
  lonelyplanet:     null,
};

function Placeholder({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect width="16" height="16" rx="3" stroke="#AFAFAF" strokeDasharray="3 2" fill="none" />
      <text x="8" y="11.5" textAnchor="middle" fontSize="8" fill="#AFAFAF" fontFamily="sans-serif">?</text>
    </svg>
  );
}

export function BrandIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  const key = name.toLowerCase().trim();
  const Icon = BRAND_MAP[key];
  if (Icon === undefined) return null;
  if (Icon === null) return <Placeholder size={size} />;
  return <Icon size={size} color={color} />;
}
