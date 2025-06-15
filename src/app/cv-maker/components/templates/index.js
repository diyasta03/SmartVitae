// components/templates/index.js

// Impor setiap template sebagai DEFAULT IMPORT dari jalur filenya
import ModernTemplate from './ModernTemplate/ModernTemplate';
import ClassicTemplate from './ClassicTemplate/ClassicTemplate';
import ProfessionalTemplate from './ProfessionalTemplate/ProfessionalTemplate';
import ATSFriendlyTemplate from './ATSFriendlyTemplate/ATSFriendlyTemplate'; // <<< Ubah ini menjadi default import

// Ekspor kembali template-template tersebut sebagai NAMED EXPORTS
export {
  ModernTemplate,
  ClassicTemplate,
  ProfessionalTemplate,
  ATSFriendlyTemplate // Sekarang ini akan mereferensikan default import di atas
};