"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AvatarUpload({ initialAvatarUrl, userInitials }: { initialAvatarUrl?: string | null, userInitials?: string }) {
  const [avatarBase64, setAvatarBase64] = React.useState<string | null>(initialAvatarUrl || null);
  const [isCompressing, setIsCompressing] = React.useState(false);
  
  // Sincronizar si cambia la prop asíncrona
  React.useEffect(() => {
    if (initialAvatarUrl) {
      setAvatarBase64(initialAvatarUrl);
    }
  }, [initialAvatarUrl]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecciona un archivo de imagen válido.");
      return;
    }

    try {
      setIsCompressing(true);

      // Regla de Negocio: Comprimir imagen a máximo ~200kb en el cliente
      const options = {
        maxSizeMB: 0.2, // 200KB
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      
      // Para efectos visuales y de demo, lo convertimos a Base64
      // En el entorno real, enviaríamos "compressedFile" a Supabase Storage
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setAvatarBase64(reader.result as string);
        toast.success(`Foto actualizada y comprimida exitosamente (${(compressedFile.size / 1024).toFixed(1)} KB)`);
        setIsCompressing(false);
      };
      
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      toast.error("Hubo un error al procesar tu imagen.");
      setIsCompressing(false);
    }
  };

  return (
    <div className="relative group cursor-pointer w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-background shadow-xl shrink-0 bg-secondary/50 flex items-center justify-center">
      {avatarBase64 ? (
        <img src={avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl font-extrabold text-muted-foreground/50">{userInitials || "ES"}</span>
      )}
      
      {/* Overlay al hacer hover */}
      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {isCompressing ? (
          <Loader2 className="animate-spin text-white" size={24} />
        ) : (
          <>
            <Camera className="text-white mb-1" size={24} />
            <span className="text-white text-[10px] font-semibold tracking-wider uppercase">Cambiar</span>
          </>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isCompressing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title="Sube tu foto de perfil"
      />
    </div>
  );
}
