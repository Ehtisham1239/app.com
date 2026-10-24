import { SiteIcon } from "./icons";
import { CONTENT_ICON_SYMBOLS } from "@/lib/site-icon-names";

export function ContentIcon({ name, className = "size-6", strokeWidth = 1.6, ...props }) {
  return <SiteIcon name={CONTENT_ICON_SYMBOLS[name] || "book-open"} className={className} strokeWidth={strokeWidth} {...props} />;
}
