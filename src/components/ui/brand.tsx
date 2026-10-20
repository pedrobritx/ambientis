import identity from "../../brand/identity.json";
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      className="brand-symbol"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={identity.markPath} />
    </svg>
  );
}
export function BrandLogo() {
  return (
    <>
      <img
        className="brand-full brand-dawn"
        src="/brand/ambientis-logo-forest.svg"
        alt=""
        width="300"
        height="80"
      />
      <img
        className="brand-full brand-dusk"
        src="/brand/ambientis-logo-reverse.svg"
        alt=""
        width="300"
        height="80"
      />
      <BrandMark />
    </>
  );
}
