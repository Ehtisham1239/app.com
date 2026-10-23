"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
const ContactForm=dynamic(()=>import("./contact-form").then(m=>m.ContactForm),{ssr:false,loading:()=> <p role="status">Loading enquiry form…</p>});
export function HomeContact(props){
  const ref=useRef(null),[ready,setReady]=useState(false);
  useEffect(()=>{if(!("IntersectionObserver" in window))return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setReady(true);observer.disconnect();}},{rootMargin:"600px"});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[]);
  return <div ref={ref} className={ready ? undefined : "min-h-[760px]"}>{ready ? <ContactForm {...props}/> : <div className="surface p-8 text-center"><button type="button" className="btn btn-primary" onClick={()=>setReady(true)}>Open enquiry form</button><p className="mt-4 text-sm text-ink-soft">You can also <Link className="text-leaf-700 underline" href="/contact">visit our contact page</Link>.</p></div>}</div>;
}
