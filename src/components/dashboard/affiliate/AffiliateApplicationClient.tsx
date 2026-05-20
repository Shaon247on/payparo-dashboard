"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Upload, HelpCircle, ArrowRight, ShieldCheck, Sparkles, LogIn } from "lucide-react";
import Link from "next/link";

export default function AffiliateApplicationClient() {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState("telegram");
  const [commName, setCommName] = useState("");
  const [commUrl, setCommUrl] = useState("");
  const [commCount, setCommCount] = useState("");
  const [commDesc, setCommDesc] = useState("");
  const [slug, setSlug] = useState("");
  const [taxId, setTaxId] = useState("");
  const [bizName, setBizName] = useState("");
  const [country, setCountry] = useState("MX");
  const [bankName, setBankName] = useState("");
  const [clabe, setClabe] = useState("");
  const [holderName, setHolderName] = useState("");

  // Files
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [taxFile, setTaxFile] = useState<File | null>(null);

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!fullName || !email || !phone || !password) {
        setError("Please fill out all contact and password details.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!commName || !commUrl || !commCount || !slug) {
        setError("Please fill out all community parameters.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!taxId || !bankName || !clabe || !holderName) {
        setError("Please fill out all tax and bank details.");
        return;
      }
      if (clabe.length !== 18) {
        setError("CLABE must be exactly 18 digits.");
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!govIdFile || !addressFile || !taxFile) {
      setError("Please select all required documents.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("full_name", fullName);
      fd.append("email", email);
      fd.append("phone", phone);
      fd.append("password", password);
      fd.append("platform", platform);
      fd.append("community_name", commName);
      fd.append("community_url", commUrl);
      fd.append("community_member_count", commCount);
      fd.append("community_description", commDesc);
      fd.append("desired_slug", slug);
      fd.append("tax_id", taxId);
      fd.append("business_name", bizName);
      fd.append("country", country);
      fd.append("bank_name", bankName);
      fd.append("clabe", clabe);
      fd.append("account_holder_name", holderName);
      fd.append("id_document", govIdFile);
      fd.append("bank_statement", addressFile);
      fd.append("tax_document", taxFile);

      try {
        const res = await fetch("/api/proxy/affiliate/apply/", {
          method: "POST",
          body: fd,
        });

        const body = await res.json();
        if (res.ok) {
          setSuccess("Application submitted! Our internal staff will manually audit your documents within 3 business days.");
          setStep(5);
        } else {
          setError(body.error ?? "Failed to submit application.");
        }
      } catch {
        setError("Network error — could not reach the server.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#00d4aa]/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 relative z-10 my-8">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#00d4aa] flex items-center justify-center font-bold text-black text-xl mx-auto shadow-lg shadow-[#00d4aa]/15">
            PP
          </div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight">PayParo Partners</h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Earn recurring commission for lifetime by referring users to our secure marketplace escrow platform.
          </p>
        </div>

        {/* Step progress bar */}
        {step < 5 && (
          <div className="flex justify-between items-center px-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-initial">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  step === s ? "bg-[#00d4aa] text-black border-[#00d4aa] shadow-lg shadow-[#00d4aa]/10" :
                  step > s ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  "bg-white/5 text-white/30 border-white/5"
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`h-[2px] flex-1 mx-2 transition-all ${
                    step > s ? "bg-emerald-500/20" : "bg-white/5"
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        <Card className="bg-[#13151e] border-white/5 shadow-2xl relative overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-3 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Contact info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-white font-bold text-base">Contact Details</h3>
                  <p className="text-white/40 text-xs">Tell us who you are so we can review your credentials.</p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div>
                    <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Full Legal Name</label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Robert Smith"
                      required
                      className="bg-white/5 border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Email Address</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        required
                        className="bg-white/5 border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Phone Number</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +52 55 1234 5678"
                        required
                        className="bg-white/5 border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Choose Account Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      className="bg-white/5 border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold text-xs py-5 mt-4">
                  Next Step <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            )}

            {/* Step 2: Community details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-white font-bold text-base">Community Parameters</h3>
                  <p className="text-white/40 text-xs">Verify your active influencer audience or admin channel.</p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Influencer Platform</label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 h-9"
                      >
                        <option value="telegram" className="bg-[#13151e]">Telegram Channel</option>
                        <option value="discord" className="bg-[#13151e]">Discord Server</option>
                        <option value="youtube" className="bg-[#13151e]">YouTube Channel</option>
                        <option value="twitter" className="bg-[#13151e]">X / Twitter Profile</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Vanity Slug Preference</label>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="e.g. cryptoking"
                        required
                        className="bg-white/5 border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Community Name</label>
                    <Input
                      value={commName}
                      onChange={(e) => setCommName(e.target.value)}
                      placeholder="e.g. Bob's Crypto Channel"
                      required
                      className="bg-white/5 border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Community Link (URL)</label>
                      <Input
                        value={commUrl}
                        onChange={(e) => setCommUrl(e.target.value)}
                        placeholder="https://t.me/yourchannel"
                        required
                        className="bg-white/5 border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Member / Subscriber Count</label>
                      <Input
                        type="number"
                        value={commCount}
                        onChange={(e) => setCommCount(e.target.value)}
                        placeholder="e.g. 25000"
                        required
                        className="bg-white/5 border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Audience & Channel Description</label>
                    <Textarea
                      value={commDesc}
                      onChange={(e) => setCommDesc(e.target.value)}
                      placeholder="Tell us about the transaction flows and content you promote..."
                      className="bg-white/5 border-white/10 text-white text-xs"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-white/50 text-xs">Back</Button>
                  <Button onClick={handleNext} className="flex-1 bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold text-xs py-5">
                    Next Step <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Tax & Bank info */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-white font-bold text-base">Tax & Bank Information</h3>
                  <p className="text-white/40 text-xs">Input legal business details and payout accounts.</p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Tax Registration ID (RFC)</label>
                      <Input
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                        placeholder="RFC Tax ID"
                        required
                        className="bg-white/5 border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Legal Business Name</label>
                      <Input
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                        placeholder="e.g. Media SA de CV"
                        className="bg-white/5 border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3.5">
                    <h4 className="text-white/60 font-semibold text-xs uppercase tracking-wider">SPEI Payout Account</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Bank Name</label>
                        <Input
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. BBVA"
                          required
                          className="bg-white/5 border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">18-Digit CLABE</label>
                        <Input
                          value={clabe}
                          onChange={(e) => setClabe(e.target.value.replace(/[^0-9]/g, ""))}
                          maxLength={18}
                          placeholder="012345678901234567"
                          required
                          className="bg-white/5 border-white/10 text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/50 text-[10px] mb-1.5 block uppercase tracking-wider">Account Holder Name</label>
                      <Input
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                        placeholder="Must match bank records"
                        required
                        className="bg-white/5 border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="text-white/50 text-xs">Back</Button>
                  <Button onClick={handleNext} className="flex-1 bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold text-xs py-5">
                    Next Step <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Documents Upload */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-white font-bold text-base">Required Documents</h3>
                  <p className="text-white/40 text-xs">Upload digital copies of compliance items to finalize.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-xs font-semibold">Government ID / Passport</h4>
                      <p className="text-white/30 text-[10px] mt-0.5">Official photo ID or voter card</p>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setGovIdFile(e.target.files?.[0] ?? null)}
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-xs text-white/70 hover:text-white flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        {govIdFile ? `${govIdFile.name.slice(0, 10)}...` : "Select ID"}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-xs font-semibold">Proof of Address</h4>
                      <p className="text-white/30 text-[10px] mt-0.5">Utility bill from last 3 months</p>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setAddressFile(e.target.files?.[0] ?? null)}
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-xs text-white/70 hover:text-white flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        {addressFile ? `${addressFile.name.slice(0, 10)}...` : "Select Address"}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-xs font-semibold">Tax Registration (RFC)</h4>
                      <p className="text-white/30 text-[10px] mt-0.5">Mexican Constancia de Situación Fiscal</p>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setTaxFile(e.target.files?.[0] ?? null)}
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-xs text-white/70 hover:text-white flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        {taxFile ? `${taxFile.name.slice(0, 10)}...` : "Select Tax Doc"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button type="button" variant="ghost" onClick={() => setStep(3)} className="text-white/50 text-xs">Back</Button>
                  <Button type="submit" disabled={isPending} className="flex-1 bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold text-xs py-5">
                    {isPending ? "Submitting Application..." : "Confirm & Submit Application"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 5: Completed state */}
            {step === 5 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-bold text-lg">Application Submitted</h3>
                  <p className="text-white/40 text-xs max-w-sm mx-auto leading-relaxed">
                    Thank you! Our compliance team is manually reviewing your tax registrations, community activity, and bank information. You will receive an email notice within 3 days.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Link href="/login" className="flex items-center justify-center gap-2 text-[#00d4aa] hover:underline text-xs font-semibold mx-auto">
                    <LogIn className="w-4 h-4" /> Go back to Login
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
