import Image from "next/image";

export default function Avatar({ url, size = 24, alt = "Avatar" }: { url?: string; size?: number; alt?: string }) {
  if (!url) {
    return (
      <span style={{ width: size, height: size, fontSize: size * 0.8 }} className="inline-flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
        👤
      </span>
    );
  }
  return (
    <Image
      src={url}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover border border-zinc-300 dark:border-zinc-700"
      style={{ width: size, height: size }}
    />
  );
}
