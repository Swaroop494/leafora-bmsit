import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Leafora" }, { name: "description", content: "Sign in to log and monitor campus trees." }, { property: "og:title", content: "Sign in — Leafora" }, { property: "og:description", content: "Sign in to Leafora." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Login,
});
function Login() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [show, setShow] = useState(false); const [tried, setTried] = useState(false); const [done, setDone] = useState(false);
  const eErr = tried && !/^\S+@\S+\.\S+$/.test(email) ? "Enter a valid email" : ""; const pErr = tried && pw.length < 8 ? "At least 8 characters" : "";
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:px-10">
      <div><p className="eyebrow text-primary">Field log access</p><h1 className="mt-4 text-6xl leading-[0.95]">Welcome back to the canopy.</h1></div>
      <form noValidate className="space-y-6 rounded-md border bg-card p-8 shadow-lift" onSubmit={(e) => { e.preventDefault(); setTried(true); if (/^\S+@\S+\.\S+$/.test(email) && pw.length >= 8) setDone(true); }}>
        <label className="block"><span className="eyebrow text-muted-foreground">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!eErr} className={`mt-2 w-full rounded-sm border bg-background px-3 py-3 ${eErr ? "border-destructive" : "border-input"}`} />{eErr && <span className="text-xs text-destructive">{eErr}</span>}</label>
        <label className="block"><span className="eyebrow text-muted-foreground">Password</span><div className="relative mt-2"><input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!pErr} className={`w-full rounded-sm border bg-background px-3 py-3 pr-16 ${pErr ? "border-destructive" : "border-input"}`} /><button type="button" onClick={() => setShow(!show)} className="eyebrow absolute right-3 top-3.5">{show ? "Hide" : "Show"}</button></div>{pErr && <span className="text-xs text-destructive">{pErr}</span>}</label>
        <button className="w-full rounded-sm bg-primary px-6 py-3 text-primary-foreground">Sign in</button>
        {done && <p className="text-sm text-healthy">Details look good — sign-in will connect once the backend is added.</p>}
      </form>
    </div>
  );
}
