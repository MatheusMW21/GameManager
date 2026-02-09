import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <SignIn appearance={{
        elements: {
          formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-sm normal-case',
          footerActionLink: 'text-purple-400 hover:text-purple-300'
        }
      }} afterSignInUrl="/" />
    </div>
  );
}
