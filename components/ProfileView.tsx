
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { supabaseService } from '../services/supabaseService';
import { User, Camera, Loader2, X, ArrowLeft } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (user.status !== 'Active') {
      alert("Account must be active to change profile image.");
      return;
    }

    setUploading(true);
    try {
      const res = await supabaseService.uploadDealerImage(user.id, file);
      if (res.success && res.url) {
        onUpdate({ ...user, profile_img: res.url });
      } else {
        alert("Image upload failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const getChequeImageUrl = (imageName: string) => {
    const { data } = supabaseService.supabase.storage.from('cheques_images').getPublicUrl(imageName);
    return data.publicUrl;
  }

  if (selectedImage) {
    return (
        <div className="bg-white min-h-screen pb-40 px-6 pt-8 font-bold">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => setSelectedImage(null)} className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-black">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-black tracking-tighter uppercase italic">Cheque Image</h1>
            </header>
            <div className="relative p-4 bg-white rounded-lg max-w-3xl max-h-[90vh]">
                <img src={selectedImage} alt="Full-size cheque" className="rounded-lg object-contain h-full w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pb-40 px-6 pt-10 space-y-8 font-bold">
      <div className="flex flex-col items-center gap-6">
          <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                {user.profile_img ? (
                  <img src={user.profile_img} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
              <button 
                onClick={() => user.status === 'Active' && fileInputRef.current?.click()}
                disabled={uploading || user.status !== 'Active'}
                className="absolute bottom-0 right-0 p-2.5 bg-red-600 text-white rounded-full border-4 border-white active:scale-90 shadow-lg disabled:bg-slate-300"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
      </div>

      <div className="space-y-4">
         <Field label="Dealer Shop Name" value={user.shop_name} color="text-black" />
         <Field label="Dealer Name" value={user.owner_name} color="text-blue-600" />
         <Field label="Address" value={`${user.address}, ${user.city}, ${user.state}`} color="text-black" />
         <Field label="Mobile No" value={user.mobile} color="text-green-600" />
         <Field label="Pincode" value={user.pincode} color="text-orange-500" />
         <Field 
           label={`Cheque No (${user.cheques_number?.length || 0})`} 
           value={user.cheques_number?.join(', ') || 'N/A'} 
           color="text-red-600" 
          />
      </div>

      {user.cheques_img_url && user.cheques_img_url.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">Cheque Images</p>
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex flex-wrap gap-4">
            {user.cheques_img_url.map((url, index) => (
              <img 
                key={index} 
                src={getChequeImageUrl(url)} 
                alt={`Cheque ${index + 1}`} 
                className="rounded-lg w-16 h-16 object-cover cursor-pointer" 
                onClick={() => setSelectedImage(getChequeImageUrl(url))}
              />
            ))}
          </div>
        </div>
      )}

      <div className="text-center pt-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RCM Dealer Profile</p>
      </div>
    </div>
  );
};

const Field = ({ label, value, color }: any) => (
  <div className="p-4 bg-white rounded-2xl border-2 border-slate-100">
     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
     <p className={`text-[14px] font-bold uppercase tracking-tight ${color}`}>{value}</p>
  </div>
);
