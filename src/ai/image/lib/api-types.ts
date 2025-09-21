export interface GenerateImageRequest {
  prompt: string;
  imageUrls: string[];
}

export interface GenerateImageResponse {
  imageUrl?: string;
  revisedPrompt?: string;
  error?: string;
}
