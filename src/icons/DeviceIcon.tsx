import { Laptop, Smartphone } from 'lucide-react';

export function DeviceIcon({ device, size = 16 }: { device: string; size?: number }) {
  if (device === 'desktop') return <Laptop size={size} />;
  if (device === 'mobile')  return <Smartphone size={size} />;
  if (device === 'both')    return <><Laptop size={size} /><Smartphone size={size} /></>;
  return null;
}
