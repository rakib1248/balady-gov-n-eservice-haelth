import Image from "next/image";
import aiLogo from "../../../public/asset/footer-ai.svg";
import footerLogos from "../../../public/asset/footer_logos.svg";

export default function FooterReferenceLogo({ arabic }: { arabic: boolean }) {
  return <>
    <Image src={aiLogo} width={106} height={42} alt={arabic ? "عام الذكاء الاصطناعي" : "Year of Artificial Intelligence"} />
    <a href="https://www.vision2030.gov.sa/" target="_blank" rel="noreferrer">
      <Image src={footerLogos} width={366} height={53} alt={arabic ? "بلدي ورؤية السعودية 2030" : "Balady and Saudi Vision 2030"} />
    </a>
  </>;
}
