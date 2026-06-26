import { FileText, FileSpreadsheet, Presentation, Image, File } from 'lucide-react';
import { getFileTypeColor } from '../../utils/formatters';

export default function FileTypeIcon({ fileType, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const iconSizes = { sm: 13, md: 17, lg: 22 };
  const color = getFileTypeColor(fileType);

  const icons = {
    pdf: FileText, word: FileText, excel: FileSpreadsheet,
    powerpoint: Presentation, image: Image,
  };
  const Icon = icons[fileType] || File;

  return (
    <div className={`${sizes[size]} rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon size={iconSizes[size]} />
    </div>
  );
}
