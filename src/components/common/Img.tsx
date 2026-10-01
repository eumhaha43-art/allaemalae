/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";

/**
 * Thin wrapper around <img>. The Figma assets are plain SVG/PNG files served
 * straight from /public, so they skip next/image (which refuses to optimise
 * SVG without `dangerouslyAllowSVG`).
 */
export default function Img({ alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} {...props} />;
}
