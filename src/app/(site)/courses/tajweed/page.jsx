import { LEARNING_GUIDES } from "@/lib/learning-guides";
import { LearningGuidePage } from "@/components/site/learning-guide-page";
import { getPage } from "@/lib/site-data";
import { contentMetadata } from "@/lib/seo-metadata";
const guide=LEARNING_GUIDES.find(g=>g.topic==='tajweed');
export const revalidate=300;
export async function generateMetadata(){const p=await getPage(guide.slug);return p?contentMetadata(p,{path:guide.path,description:p.seo_description||p.excerpt}):{title:'Tajweed learning'};}
export default function Page(){return <LearningGuidePage guide={guide}/>;}
