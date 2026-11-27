import { AU_WHATSAPP } from "@/components/site/chrome";

export function AustraliaWhatsApp() {
  return (
    <a className="btn btn-outline" href={AU_WHATSAPP.href} target="_blank" rel="noopener noreferrer">
      WhatsApp Australia · {AU_WHATSAPP.display}
    </a>
  );
}

