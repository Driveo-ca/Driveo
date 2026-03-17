'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BlobBasicInfo, BlobLocation, BlobExperience, BlobDocuments, BlobReview } from '@/components/apply/GradientBlobs';
import { CursorProvider } from '@/components/CursorProvider';
import { NoiseOverlay } from '@/components/NoiseOverlay';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Compress image files to stay under Vercel's 4.5MB body limit
async function compressImage(file: File, maxSizeMB = 1): Promise<File> {
  // Skip non-image files (e.g. PDFs)
  if (!file.type.startsWith('image/')) return file;
  // Skip if already small enough
  if (file.size <= maxSizeMB * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      // Scale down if very large
      let { width, height } = img;
      const maxDim = 1600;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.7
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

const TOTAL_STEPS = 5;

const stepInfo = [
  { num: '01', title: 'Basic Info', subtitle: 'Let\'s start with who you are' },
  { num: '02', title: 'Location', subtitle: 'Where are you based?' },
  { num: '03', title: 'Experience', subtitle: 'Tell us about your skills' },
  { num: '04', title: 'Documents', subtitle: 'Upload your credentials' },
  { num: '05', title: 'Review', subtitle: 'Double-check everything' },
];

const provinces = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan',
];

export interface FormData {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  experienceLevel: 'trained' | 'fresher' | '';
  yearsExperience: string;
  maxWashesPerDay: string;
  governmentId: File | null;
  governmentIdName: string;
  insurance: File | null;
  insuranceName: string;
  agreedToTerms: boolean;
}

const initialFormData: FormData = {
  fullName: '',
  phone: '',
  streetAddress: '',
  city: '',
  province: '',
  postalCode: '',
  experienceLevel: '',
  yearsExperience: '',
  maxWashesPerDay: '4',
  governmentId: null,
  governmentIdName: '',
  insurance: null,
  insuranceName: '',
  agreedToTerms: false,
};

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const update = (field: keyof FormData, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    } else if (step === 1) {
      if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.province) newErrors.province = 'Province is required';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    } else if (step === 2) {
      if (!formData.experienceLevel) newErrors.experienceLevel = 'Please select your experience level';
      if (formData.experienceLevel === 'trained' && !formData.yearsExperience) newErrors.yearsExperience = 'Years of experience is required';
    } else if (step === 3) {
      if (!formData.governmentId) newErrors.governmentId = 'Government ID is required';
    } else if (step === 4) {
      if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);

    try {
      const fd = new window.FormData();
      fd.append('fullName', formData.fullName);
      fd.append('phone', formData.phone);
      fd.append('streetAddress', formData.streetAddress);
      fd.append('city', formData.city);
      fd.append('province', formData.province);
      fd.append('postalCode', formData.postalCode);
      fd.append('experienceLevel', formData.experienceLevel);
      fd.append('yearsExperience', formData.yearsExperience);
      fd.append('maxWashesPerDay', formData.maxWashesPerDay);
      if (formData.governmentId) fd.append('governmentId', formData.governmentId);
      if (formData.insurance) fd.append('insurance', formData.insurance);

      const res = await fetch('/api/apply', { method: 'POST', body: fd });

      if (res.ok) {
        router.push('/apply/thank-you');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (field: 'governmentId' | 'insurance', e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0] || null;
    if (!raw) {
      update(field, null);
      update(`${field}Name` as keyof FormData, '');
      return;
    }
    const file = await compressImage(raw);
    update(field, file);
    update(`${field}Name` as keyof FormData, raw.name);
  };

  const BlobComponent = [BlobBasicInfo, BlobLocation, BlobExperience, BlobDocuments, BlobReview][step];

  return (
    <CursorProvider>
      <div className="bg-[#050505] text-white min-h-screen flex flex-col selection:bg-[#E23232] selection:text-white">
        <NoiseOverlay />
        {/* Top bar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-5 flex justify-between items-center bg-[#050505]/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/apply">
          <Image src="/Driveo-logo.png" alt="DRIVEO" width={120} height={40} className="h-7 w-auto" priority />
        </Link>
        <span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.3em]">
          Step {step + 1} of {TOTAL_STEPS}
        </span>
      </nav>

      {/* Progress bar */}
      <div className="fixed top-[61px] left-0 w-full z-40 h-[2px] bg-white/5">
        <motion.div
          className="h-full bg-[#E23232]"
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.5, ease }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row pt-[63px] min-h-screen">
        {/* Left — Illustration */}
        <div className="hidden lg:flex lg:w-[40%] bg-[#0a0a0a] border-r border-white/[0.06] items-center justify-center p-12 relative overflow-hidden sticky top-[63px] h-[calc(100vh-63px)]">
          {/* Background ambient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[#E23232]/[0.04] rounded-full blur-[100px]" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease }}
              className="w-full h-[400px] relative z-10"
            >
              <BlobComponent />
            </motion.div>
          </AnimatePresence>

          {/* Step info below illustration */}
          <div className="absolute bottom-12 left-12 right-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <span className="font-mono text-[10px] text-[#E23232] uppercase tracking-[0.3em] block mb-2">
                  Step {stepInfo[step].num}
                </span>
                <h2 className="font-display text-3xl uppercase mb-1">{stepInfo[step].title}</h2>
                <p className="font-mono text-[11px] text-white/50 tracking-wider">{stepInfo[step].subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex flex-col">
          {/* Mobile step header */}
          <div className="lg:hidden px-6 pt-8 pb-4">
            <span className="font-mono text-[10px] text-[#E23232] uppercase tracking-[0.3em] block mb-1">
              Step {stepInfo[step].num}
            </span>
            <h2 className="font-display text-2xl uppercase">{stepInfo[step].title}</h2>
            <p className="font-mono text-[11px] text-white/50 tracking-wider">{stepInfo[step].subtitle}</p>
          </div>

          {/* Step indicators */}
          <div className="px-6 lg:px-12 pt-6 lg:pt-10 flex gap-2">
            {stepInfo.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                <motion.div
                  className="h-full bg-[#E23232] rounded-full"
                  initial={false}
                  animate={{ width: idx < step ? '100%' : idx === step ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease }}
                  style={{ opacity: idx === step ? 1 : idx < step ? 0.5 : 0 }}
                />
              </div>
            ))}
          </div>

          {/* Form steps */}
          <div className="flex-1 px-6 lg:px-12 py-8 lg:py-12 overflow-y-auto">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease }}
                className="max-w-lg"
              >
                {step === 0 && <StepBasicInfo formData={formData} update={update} errors={errors} />}
                {step === 1 && <StepLocation formData={formData} update={update} errors={errors} />}
                {step === 2 && <StepExperience formData={formData} update={update} errors={errors} />}
                {step === 3 && <StepDocuments formData={formData} handleFileChange={handleFileChange} errors={errors} />}
                {step === 4 && <StepReview formData={formData} update={update} errors={errors} goToStep={(s) => { setDirection(s < step ? -1 : 1); setStep(s); }} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom navigation */}
          <div className="px-6 lg:px-12 py-6 border-t border-white/10 flex justify-between items-center bg-[#050505]/90 backdrop-blur-sm">
            <motion.button
              onClick={prev}
              className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-full border border-white/20 hover:border-white/40 transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>

            {step < TOTAL_STEPS - 1 ? (
              <motion.button
                onClick={next}
                className="flex items-center gap-2 bg-[#E23232] text-white font-mono text-xs uppercase tracking-widest px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#E23232] text-white font-mono text-xs uppercase tracking-widest px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all disabled:opacity-50"
                whileHover={{ scale: submitting ? 1 : 1.03 }}
                whileTap={{ scale: submitting ? 1 : 0.97 }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
      </div>
    </CursorProvider>
  );
}

// ——— Step Components ———

function InputField({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full">
      <label className="font-mono text-[11px] text-white/80 uppercase tracking-widest block mb-2">{label}</label>
      <input
        {...props}
        className={`w-full bg-[#111] border ${error ? 'border-[#E23232]/60' : 'border-white/10'} rounded-xl px-5 py-4 font-mono text-sm outline-none focus:border-[#E23232] transition-colors text-white placeholder:text-white/30`}
      />
      {error && <p className="font-mono text-[10px] text-[#E23232] mt-1.5">{error}</p>}
    </div>
  );
}

function StepBasicInfo({ formData, update, errors }: { formData: FormData; update: (f: keyof FormData, v: string) => void; errors: Record<string, string> }) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="font-display text-3xl lg:text-4xl uppercase mb-2">Tell Us About<br /><span className="text-[#E23232]">Yourself</span></h3>
        <p className="font-mono text-[12px] text-white/65 tracking-wider">We&apos;ll use this to reach out to you.</p>
      </div>
      <InputField label="Full Name" placeholder="John Doe" value={formData.fullName} onChange={e => update('fullName', e.target.value)} error={errors.fullName} />
      <InputField label="Phone Number" placeholder="(416) 000-0000" type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)} error={errors.phone} />
    </div>
  );
}

function StepLocation({ formData, update, errors }: { formData: FormData; update: (f: keyof FormData, v: string) => void; errors: Record<string, string> }) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="font-display text-3xl lg:text-4xl uppercase mb-2">Where Are<br /><span className="text-[#E23232]">You Based?</span></h3>
        <p className="font-mono text-[12px] text-white/65 tracking-wider">We match you with jobs near your location.</p>
      </div>
      <InputField label="Street Address" placeholder="123 Main Street" value={formData.streetAddress} onChange={e => update('streetAddress', e.target.value)} error={errors.streetAddress} />
      <div className="flex gap-4">
        <InputField label="City" placeholder="Toronto" value={formData.city} onChange={e => update('city', e.target.value)} error={errors.city} />
        <InputField label="Postal Code" placeholder="M5V 2T6" value={formData.postalCode} onChange={e => update('postalCode', e.target.value)} error={errors.postalCode} />
      </div>
      <div className="w-full">
        <label className="font-mono text-[11px] text-white/80 uppercase tracking-widest block mb-2">Province</label>
        <select
          value={formData.province}
          onChange={e => update('province', e.target.value)}
          className={`w-full bg-[#111] border ${errors.province ? 'border-[#E23232]/60' : 'border-white/10'} rounded-xl px-5 py-4 font-mono text-sm outline-none focus:border-[#E23232] transition-colors text-white appearance-none cursor-pointer`}
        >
          <option value="" disabled className="bg-[#111]">Select province</option>
          {provinces.map(p => <option key={p} value={p} className="bg-[#111]">{p}</option>)}
        </select>
        {errors.province && <p className="font-mono text-[10px] text-[#E23232] mt-1.5">{errors.province}</p>}
      </div>
    </div>
  );
}

function StepExperience({ formData, update, errors }: { formData: FormData; update: (f: keyof FormData, v: string) => void; errors: Record<string, string> }) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="font-display text-3xl lg:text-4xl uppercase mb-2">Your<br /><span className="text-[#E23232]">Experience</span></h3>
        <p className="font-mono text-[12px] text-white/65 tracking-wider">Fresher or pro — both welcome.</p>
      </div>

      {/* Experience level cards */}
      <div>
        <label className="font-mono text-[11px] text-white/80 uppercase tracking-widest block mb-3">Experience Level</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'trained', label: 'Trained Pro', desc: '2+ years of detailing experience' },
            { value: 'fresher', label: 'Fresher', desc: 'Willing to learn the DRIVEO way' },
          ].map(opt => (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => update('experienceLevel', opt.value)}
              className={`text-left p-5 rounded-xl border transition-all duration-300 ${
                formData.experienceLevel === opt.value
                  ? 'border-[#E23232] bg-[#E23232]/[0.08]'
                  : 'border-white/10 bg-[#111] hover:border-white/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-display text-lg uppercase block mb-1">{opt.label}</span>
              <span className="font-mono text-[11px] text-white/70 tracking-wider">{opt.desc}</span>
            </motion.button>
          ))}
        </div>
        {errors.experienceLevel && <p className="font-mono text-[10px] text-[#E23232] mt-1.5">{errors.experienceLevel}</p>}
      </div>

      {/* Years — only if trained */}
      <AnimatePresence>
        {formData.experienceLevel === 'trained' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <InputField
              label="Years of Experience"
              placeholder="e.g. 3"
              type="number"
              min="1"
              max="30"
              value={formData.yearsExperience}
              onChange={e => update('yearsExperience', e.target.value)}
              error={errors.yearsExperience}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Max washes per day */}
      <div>
        <label className="font-mono text-[11px] text-white/80 uppercase tracking-widest block mb-3">
          Max Car Washes Per Day — <span className="text-[#E23232]">{formData.maxWashesPerDay}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.maxWashesPerDay}
          onChange={e => update('maxWashesPerDay', e.target.value)}
          className="w-full accent-[#E23232] h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E23232]"
        />
        <div className="flex justify-between font-mono text-[9px] text-white/30 mt-1">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}

function StepDocuments({ formData, handleFileChange, errors }: { formData: FormData; handleFileChange: (field: 'governmentId' | 'insurance', e: React.ChangeEvent<HTMLInputElement>) => void; errors: Record<string, string> }) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="font-display text-3xl lg:text-4xl uppercase mb-2">Upload Your<br /><span className="text-[#E23232]">Documents</span></h3>
        <p className="font-mono text-[12px] text-white/65 tracking-wider">Securely uploaded. Only reviewed by our team.</p>
      </div>

      {/* Government ID */}
      <div>
        <label className="font-mono text-[11px] text-white/80 uppercase tracking-widest block mb-3">
          Government-Issued ID <span className="text-[#E23232]">*</span>
        </label>
        <label className={`block border-2 border-dashed ${errors.governmentId ? 'border-[#E23232]/60' : 'border-white/10 hover:border-white/20'} rounded-xl p-8 text-center cursor-pointer transition-colors group`}>
          <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange('governmentId', e)} className="hidden" />
          {formData.governmentIdName ? (
            <div className="flex items-center justify-center gap-3">
              <Check className="w-5 h-5 text-[#E23232]" />
              <span className="font-mono text-sm text-white/80">{formData.governmentIdName}</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-[#E23232]/10 flex items-center justify-center mx-auto mb-3 transition-colors">
                <svg className="w-6 h-6 text-white/40 group-hover:text-[#E23232] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" /></svg>
              </div>
              <span className="font-mono text-[13px] text-white/75 tracking-wider block">
                Drop file here or click to upload
              </span>
              <span className="font-mono text-[11px] text-white/55 tracking-wider block mt-1">
                JPG, PNG, or PDF — max 10MB
              </span>
            </>
          )}
        </label>
        {errors.governmentId && <p className="font-mono text-[10px] text-[#E23232] mt-1.5">{errors.governmentId}</p>}
      </div>

      {/* Insurance */}
      <div>
        <label className="font-mono text-[11px] text-white/80 uppercase tracking-widest block mb-3">
          Insurance Certificate <span className="text-white/50">(optional)</span>
        </label>
        <label className="block border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl p-8 text-center cursor-pointer transition-colors group">
          <input type="file" accept=".pdf,image/*" onChange={e => handleFileChange('insurance', e)} className="hidden" />
          {formData.insuranceName ? (
            <div className="flex items-center justify-center gap-3">
              <Check className="w-5 h-5 text-[#E23232]" />
              <span className="font-mono text-sm text-white/80">{formData.insuranceName}</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-[#E23232]/10 flex items-center justify-center mx-auto mb-3 transition-colors">
                <svg className="w-6 h-6 text-white/40 group-hover:text-[#E23232] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" /></svg>
              </div>
              <span className="font-mono text-[13px] text-white/75 tracking-wider block">
                Drop file here or click to upload
              </span>
              <span className="font-mono text-[11px] text-white/55 tracking-wider block mt-1">
                PDF or image — max 10MB
              </span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}

function StepReview({ formData, update, errors, goToStep }: { formData: FormData; update: (f: keyof FormData, v: boolean) => void; errors: Record<string, string>; goToStep: (s: number) => void }) {
  const sections = [
    {
      title: 'Basic Info', step: 0,
      items: [
        { label: 'Name', value: formData.fullName },
        { label: 'Phone', value: formData.phone },
      ],
    },
    {
      title: 'Location', step: 1,
      items: [
        { label: 'Address', value: `${formData.streetAddress}, ${formData.city}` },
        { label: 'Province', value: formData.province },
        { label: 'Postal Code', value: formData.postalCode },
      ],
    },
    {
      title: 'Experience', step: 2,
      items: [
        { label: 'Level', value: formData.experienceLevel === 'trained' ? 'Trained Professional' : 'Fresher' },
        ...(formData.experienceLevel === 'trained' ? [{ label: 'Years', value: `${formData.yearsExperience} years` }] : []),
        { label: 'Max Washes/Day', value: formData.maxWashesPerDay },
      ],
    },
    {
      title: 'Documents', step: 3,
      items: [
        { label: 'Government ID', value: formData.governmentIdName || 'Not uploaded' },
        { label: 'Insurance', value: formData.insuranceName || 'Not provided' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="font-display text-3xl lg:text-4xl uppercase mb-2">Review Your<br /><span className="text-[#E23232]">Application</span></h3>
        <p className="font-mono text-[12px] text-white/65 tracking-wider">Make sure everything looks good.</p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-display text-lg uppercase">{section.title}</h4>
            <button
              onClick={() => goToStep(section.step)}
              className="font-mono text-[10px] text-[#E23232] uppercase tracking-widest hover:text-white transition-colors"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2">
            {section.items.map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="font-mono text-[11px] text-white/60 uppercase tracking-widest">{item.label}</span>
                <span className="font-mono text-sm text-white/80">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Terms */}
      <div className="flex items-start gap-3 pt-4">
        <button
          type="button"
          onClick={() => update('agreedToTerms', !formData.agreedToTerms)}
          className={`w-5 h-5 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
            formData.agreedToTerms ? 'bg-[#E23232] border-[#E23232]' : 'border-white/20'
          }`}
        >
          {formData.agreedToTerms && <Check className="w-3 h-3 text-white" />}
        </button>
        <span className="font-mono text-[12px] text-white/70 tracking-wider leading-relaxed">
          I agree to the DRIVEO Partner Terms of Service and acknowledge that my information will be reviewed by the DRIVEO team.
        </span>
      </div>
      {errors.agreedToTerms && <p className="font-mono text-[10px] text-[#E23232]">{errors.agreedToTerms}</p>}
    </div>
  );
}
