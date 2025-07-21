import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center h-full group-data-[state=expanded]:justify-start group-data-[state=collapsed]:justify-center"
    >
      <Image
        src="https://jalinhealth.com/images/logo.png"
        alt="IntelliPath Logo"
        width={200} // Intrinsic width of the source image
        height={51} // Intrinsic height of the source image
        priority // Preload the logo as it's likely important for LCP
        className="block group-data-[state=expanded]:h-8 group-data-[state=expanded]:w-auto group-data-[state=collapsed]:h-7 group-data-[state=collapsed]:w-7 group-data-[state=collapsed]:object-contain"
        // Expanded sidebar: logo height is 32px (h-8), width adjusts automatically.
        // Collapsed sidebar: logo is constrained to 28x28px (h-7, w-7) box, object-contain scales it to fit.
      />
    </Link>
  );
}
