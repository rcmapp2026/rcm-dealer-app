import React, { useState, useRef, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { RCMLogo } from './RCMLogo';
import { ChevronLeft, Camera, Loader2, AlertCircle, CheckCircle2, User, Home, Smartphone, MapPin, Hash, ShieldCheck, FileText, Plus, Trash2 } from 'lucide-react';
import { UserProfile } from '../types';

interface RegistrationFormProps {
  onSuccess: (dealer: UserProfile) => void;
  onBack: () => void;
}

const FormInput = ({ id, label, icon: Icon, type = "text", value, onChange, placeholder, maxLength }: any) => (
  <div id={id} className="space-y-2">
    <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#006666] group-focus-within:text-brand-blue transition-colors">
        <Icon size={18} />
      </div>
      <input 
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        className="w-full h-16 bg-[#f0fdfa] border-4 border-[#006666] rounded-2xl pl-14 pr-6 text-black text-sm font-black outline-none focus:ring-4 focus:ring-[#006666]/20 transition-all shadow-sm italic uppercase placeholder:text-slate-600"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, onBack }) => {
  const [form, setForm] = useState({ 
      ownerName: '', 
      shopName: '', 
      mobile: '',
      address: '', 
      city: '', 
      state: 'Bihar', 
      pincode: '',
  });

  const [cheques, setCheques] = useState([{ number: '', imageUrl: '', preview: '' as string | null }]);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAddCheque = () => {
    setCheques([...cheques, { number: '', imageUrl: '', preview: null }]);
  };

  const handleRemoveCheque = (index: number) => {
    if (cheques.length <= 1) return;
    const newCheques = cheques.filter((_, i) => i !== index);
    setCheques(newCheques);
  };

  const updateCheque = (index: number, field: string, value: any) => {
    const newCheques = [...cheques];
    (newCheques[index] as any)[field] = value;
    setCheques(newCheques);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    updateCheque(index, 'preview', previewUrl);
    
    setUploadingIndex(index);
    setError('');
    
    try {
      const res = await supabaseService.uploadDealerChequesImage(file);
      if (res.success && res.url) {
        updateCheque(index, 'imageUrl', res.url);
      } else {
        setError(`Upload Failed: ${res.error}`);
        updateCheque(index, 'preview', null);
      }
    } catch (err: any) {
      setError("Vault connection timeout. Retry upload.");
      updateCheque(index, 'preview', null);
    } finally {
      setUploadingIndex(null);
    }
  };

  const scrollToField = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const input = element.querySelector('input, select') as HTMLElement;
        if (input) input.focus();
      }, 500);
    }
  };

  const handleRegister = async () => {
      if (loading || uploadingIndex !== null) return;

      const validationMap = [
        { id: 'f-owner', value: form.ownerName, label: 'Name' },
        { id: 'f-shop', value: form.shopName, label: 'Shop Name' },
        { id: 'f-mobile', value: form.mobile, label: 'Mobile Number' },
        { id: 'f-address', value: form.address, label: 'Address' },
        { id: 'f-city', value: form.city, label: 'City' },
        { id: 'f-pincode', value: form.pincode, label: 'Pin Code' },
      ];

      for (const field of validationMap) {
        if (!field.value) {
          setError(`${field.label} is required.`);
          scrollToField(field.id);
          return;
        }
      }

      if (!cheques[0].number || !cheques[0].imageUrl) {
          setError("At least one Cheque Number and Photo are required.");
          scrollToField('cheque-0');
          return;
      }

      setError('');
      setLoading(true);
      try {
        const payload = {
            ...form,
            cheques_number: cheques.map(c => c.number).filter(Boolean),
            cheques_img_urls: cheques.map(c => c.imageUrl).filter(Boolean)
        };

        const res = await supabaseService.registerDealer(payload);
        if (res.success && res.dealer) {
            onSuccess(res.dealer);
        } else {
            setError(res.error || "System rejected signal. Please verify inputs.");
        }
      } catch (e: any) {
        setError("Network sync failed. Please click Submit again.");
      } finally {
        setLoading(false);
      }
  };

  return (
      <div className="fixed inset-0 bg-white overflow-y-auto z-[90] flex flex-col no-scrollbar">
          <div className="w-full max-w-md mx-auto p-6 flex flex-col">
            <button onClick={onBack} className="self-start p-2 text-black hover:text-brand-blue transition-colors mb-4 flex items-center gap-1">
                <ChevronLeft size={20} strokeWidth={4} /> <span className="text-xs font-black uppercase tracking-widest text-black">Back</span>
            </button>

            <div className="flex flex-col items-center mb-10">
                <RCMLogo size={100} textColor="text-black" showText={false} />
                <h2 className="text-[2.2em] font-[1000] text-black uppercase tracking-tighter mt-4 italic leading-none text-center">
                    RCM<br/><span className="text-brand-orange">DEALER</span>
                </h2>
                <p className="text-black text-[10px] font-black uppercase tracking-[0.3em] mt-3">Partnership Application</p>
            </div>

            <div className="space-y-6 pb-20">
                {error && (
                    <div className="bg-rose-100 text-rose-900 p-4 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 border-2 border-rose-600 italic leading-tight sticky top-0 z-50 shadow-md">
                        <AlertCircle size={16} className="shrink-0 text-rose-700" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    <FormInput 
                        id="f-owner" label="Name" icon={User} 
                        value={form.ownerName} onChange={(v: string) => setForm({...form, ownerName: v})}
                        placeholder="ENTER YOUR FULL NAME" 
                    />
                    <FormInput 
                        id="f-shop" label="Shop Name" icon={Home} 
                        value={form.shopName} onChange={(v: string) => setForm({...form, shopName: v})}
                        placeholder="ENTER YOUR SHOP NAME" 
                    />
                    <FormInput 
                        id="f-mobile" label="Mobile Number" icon={Smartphone} type="tel" maxLength={10}
                        value={form.mobile} onChange={(v: string) => setForm({...form, mobile: v.replace(/\D/g,'')})}
                        placeholder="ENTER 10 DIGIT NUMBER" 
                    />
                    <FormInput 
                        id="f-address" label="Address" icon={MapPin} 
                        value={form.address} onChange={(v: string) => setForm({...form, address: v})}
                        placeholder="ENTER FULL ADDRESS" 
                    />
                    
                    <FormInput 
                        id="f-city" label="City" icon={ShieldCheck} 
                        value={form.city} onChange={(v: string) => setForm({...form, city: v})}
                        placeholder="ENTER CITY" 
                    />
                    <FormInput 
                        id="f-pincode" label="Pin Code" icon={Hash} maxLength={6}
                        value={form.pincode} onChange={(v: string) => setForm({...form, pincode: v.replace(/\D/g,'')})}
                        placeholder="ENTER 6 DIGIT PIN" 
                    />

                    <div className="h-1 bg-slate-900 my-4" />

                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase text-black tracking-widest italic">Bank Security (Cheques)</h3>
                            <button 
                                onClick={handleAddCheque}
                                className="flex items-center gap-2 bg-[#006666] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:bg-brand-blue transition-colors shadow-lg"
                            >
                                <Plus size={14} strokeWidth={4} /> Add Another
                            </button>
                        </div>

                        {cheques.map((cheque, index) => (
                            <div key={index} id={`cheque-${index}`} className="p-5 border-4 border-[#006666] rounded-[32px] bg-slate-50 space-y-4 relative">
                                {index > 0 && (
                                    <button 
                                        onClick={() => handleRemoveCheque(index)}
                                        className="absolute -top-3 -right-3 w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                                    >
                                        <Trash2 size={14} strokeWidth={3} />
                                    </button>
                                )}
                                
                                <FormInput 
                                    label={`Check Number #${index + 1}`} icon={FileText} 
                                    value={cheque.number} onChange={(v: string) => updateCheque(index, 'number', v.toUpperCase())}
                                    placeholder="NUMERIC OR ALPHANUMERIC" 
                                />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-1">Upload Check Photo</label>
                                    <button 
                                        onClick={() => fileInputRefs.current[index]?.click()}
                                        className={`w-full aspect-video rounded-3xl border-4 border-[#006666] border-dashed flex flex-col items-center justify-center gap-4 transition-all overflow-hidden relative group ${cheque.imageUrl ? 'border-solid border-emerald-600 bg-emerald-50' : 'bg-white'}`}
                                    >
                                        {cheque.preview ? (
                                            <img src={cheque.preview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-[#006666] flex items-center justify-center text-[#006666]">
                                                    {uploadingIndex === index ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-[#006666] uppercase tracking-widest">Snap Photo</p>
                                                </div>
                                            </>
                                        )}
                                        
                                        {cheque.imageUrl && (
                                            <div className="absolute top-3 right-3 bg-emerald-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                                                <CheckCircle2 size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={el => fileInputRefs.current[index] = el} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={(e) => handleFileUpload(index, e)} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-10">
                    <button 
                        onClick={handleRegister}
                        disabled={loading || uploadingIndex !== null}
                        className="w-full h-20 bg-brand-orange text-black text-xs font-[1000] uppercase tracking-[0.4em] rounded-[28px] active:scale-[0.97] transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl italic border-4 border-black"
                    >
                        {loading ? (
                             <div className="flex items-center gap-3">
                               <div className="w-5 h-5 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                               <span className="text-black">TRANSMITTING...</span>
                             </div>
                        ) : (
                            <>SUBMIT APPLICATION <ShieldCheck size={22} strokeWidth={3} className="text-black" /></>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-black font-black uppercase tracking-[0.3em] mt-8 opacity-100 italic">Secure End-to-End Encrypted Handshake</p>
                </div>
            </div>
          </div>
      </div>
  );
};