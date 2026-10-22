import { notFound } from "next/navigation";
import { LEARNING_GUIDES } from "@/lib/learning-guides";
import { LearningGuidePage } from "@/components/site/learning-guide-page";
import { getPage } from "@/lib/site-data";
import { contentMetadata } from "@/lib/seo-metadata";
export const revalidate=300;
export function generateStaticParams(){return LEARNING_GUIDES.filter(g=>g.path.startsWith('/learn/')).map(g=>({topic:g.topic}));}
async function resolve(params){const{topic}=await params;const guide=LEARNING_GUIDES.find(g=>g.topic===topic&&g.path.startsWith('/learn/'));if(!guide)notFound();return guide;}
export async function generateMetadata({params}){const g=await resolve(params),p=await getPage(g.slug);if(!p)return{title:'Guide not found'};return contentMetadata(p,{path:g.path,description:p.seo_description||p.excerpt});}
export default async function Page({params}){return <LearningGuidePage guide={await resolve(params)}/>;}
