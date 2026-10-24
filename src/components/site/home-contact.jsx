"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import {useState} from "react";
const ContactForm=dynamic(()=>import("./contact-form").then(m=>m.ContactForm),{ssr:false,loading:()=> <p role="status">Loading enquiry form…</p>});
export function HomeContact(props){
  const [ready,setReady]=useState(false);
  return <div id="home-enquiry">{ready ? <ContactForm {...props}/> : <div className="surface p-8 text-center"><p className="mb-5 text-ink-soft">Ask about a course, teacher or class time.</p><button type="button" className="btn btn-primary" aria-expanded={false} aria-controls="home-enquiry" onClick={()=>setReady(true)}>Open enquiry form</button><p className="mt-4 text-sm text-ink-soft">Or <Link className="text-leaf-700 underline" href="/contact">visit our contact page</Link>.</p></div>}</div>;
}
