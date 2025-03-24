export interface Banner {
  id: number;
  fileUrl: string;
  visible: boolean;
  selected: boolean;
  created_at: string;
}

export interface BannerFormData {
  file: File;
  visible: boolean;
  selected: boolean;
}
