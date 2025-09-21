'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { uploadFileFromBrowser } from '@/storage/client';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Download,
  ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useImageGeneration } from '../hooks/use-image-generation';

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12MB
const FILE_SLOTS = 2;
const DEFAULT_PROMPT =
  'Take a Polaroid-style image of my current self hugging my younger self. Keep both faces exactly the same as references, add subtle grain, mild blur, single flash from a dark room, white curtains background, handwriting caption at the bottom.';
const CELEBRITY_PROMPT =
  'Create a candid Polaroid photo with white border and date stamp, indoor on-camera flash, light film grain. Keep both faces unchanged. Make it look like a casual party snapshot of me and [celebrity] standing close, slight motion blur, warm tone';

type ModeKey = 'self' | 'celebrity';

export function ImagePlayground() {
  const t = useTranslations('AIImagePlayground');
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [localError, setLocalError] = useState<string | null>(null);
  const [files, setFiles] = useState<Array<File | null>>(
    Array(FILE_SLOTS).fill(null)
  );
  const [filePreviews, setFilePreviews] = useState<Array<string | null>>(
    Array(FILE_SLOTS).fill(null)
  );
  const filePreviewsRef = useRef(filePreviews);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMetas, setUploadedMetas] = useState<
    Array<{
      signature: string;
      url: string;
    } | null>
  >(Array(FILE_SLOTS).fill(null));
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ModeKey>('self');
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const {
    generatedImageUrl,
    isLoading,
    error,
    startGeneration,
    reset,
  } = useImageGeneration();

  useEffect(() => {
    filePreviewsRef.current = filePreviews;
  }, [filePreviews]);

  useEffect(() => {
    return () => {
      filePreviewsRef.current.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, []);

  const isBusy = isUploading || isLoading;
  const previewIsOpen = Boolean(generatedImageUrl) && isPreviewOpen;

  const getFileSignature = (inputFile: File | null) =>
    inputFile
      ? `${inputFile.name}-${inputFile.size}-${inputFile.lastModified}`
      : null;

  const allUploaded = files.every((file, index) => {
    if (!file) {
      return false;
    }

    const signature = getFileSignature(file);
    const cached = uploadedMetas[index];

    return Boolean(cached && cached.signature === (signature ?? ''));
  });

  const modes = useMemo(
    () => [
      {
        key: 'self' as ModeKey,
        title: t('modes.self.title'),
        prompt: DEFAULT_PROMPT,
      },
      {
        key: 'celebrity' as ModeKey,
        title: t('modes.celebrity.title'),
        prompt: CELEBRITY_PROMPT,
      },
    ],
    [t]
  );

  const handleModeSelect = (modeKey: ModeKey, modePrompt: string) => {
    setSelectedMode(modeKey);
    setPrompt(modePrompt);
    setLocalError(null);
  };

  const handleFileSelect = (index: number, selectedFile: File | null) => {
    if (!selectedFile) {
      setFiles((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      setUploadedMetas((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      setFilePreviews((prev) => {
        const next = [...prev];
        const existingPreview = next[index];
        if (existingPreview) {
          URL.revokeObjectURL(existingPreview);
        }
        next[index] = null;
        return next;
      });
      setLocalError(null);
      reset();
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setLocalError(t('upload.invalidType'));
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setLocalError(t('upload.tooLarge'));
      return;
    }

    setLocalError(null);
    setFiles((prev) => {
      const next = [...prev];
      next[index] = selectedFile;
      return next;
    });
    setUploadedMetas((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setFilePreviews((prev) => {
      const next = [...prev];
      const existingPreview = next[index];
      if (existingPreview) {
        URL.revokeObjectURL(existingPreview);
      }
      next[index] = URL.createObjectURL(selectedFile);
      return next;
    });
    reset();
  };

  const handleFileInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;
    handleFileSelect(index, selectedFile);
  };

  const clearFile = (index: number) => {
    handleFileSelect(index, null);
    const input = fileInputRefs.current[index];
    if (input) {
      input.value = '';
    }
  };

  const ensureUploaded = async (): Promise<string[]> => {
    const missingIndex = files.findIndex((file) => !file);

    if (missingIndex !== -1) {
      throw new Error(t('errors.missingImage'));
    }

    const needsUpload = files.some((file, index) => {
      const signature = getFileSignature(file);
      const cached = uploadedMetas[index];
      return Boolean(
        file && (!cached || cached.signature !== (signature ?? ''))
      );
    });

    if (needsUpload) {
      setIsUploading(true);
    }

    try {
      const uploadResults = await Promise.all(
        files.map(async (file, index) => {
          if (!file) {
            throw new Error(t('errors.missingImage'));
          }

          const signature = getFileSignature(file) ?? '';
          const cached = uploadedMetas[index];

          if (cached && cached.signature === signature) {
            return cached.url;
          }

          const result = await uploadFileFromBrowser(file, 'image-inputs');

          setUploadedMetas((prev) => {
            const next = [...prev];
            next[index] = {
              signature,
              url: result.url,
            };
            return next;
          });

          return result.url;
        })
      );

      return uploadResults;
    } finally {
      if (needsUpload) {
        setIsUploading(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (files.some((file) => !file)) {
      setLocalError(t('errors.missingImage'));
      return;
    }

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setLocalError(t('errors.missingPrompt'));
      return;
    }

    setLocalError(null);

    try {
      const imageUrls = await ensureUploaded();
      await startGeneration({ prompt: trimmedPrompt, imageUrls });
    } catch (err) {
      console.error('Failed to prepare generation request:', err);
      if (err instanceof Error) {
        setLocalError(
          err.message.toLowerCase().includes('upload')
            ? t('errors.uploadFailed')
            : err.message
        );
      } else {
        setLocalError(t('errors.uploadFailed'));
      }
    }
  };

  const openPreview = () => {
    if (generatedImageUrl) {
      setIsPreviewOpen(true);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) {
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: generatedImageUrl }),
      });

      if (!response.ok) {
        let message = 'Failed to download image';
        try {
          const data = (await response.json()) as { error?: string };
          if (data?.error) {
            message = data.error;
          }
        } catch (error) {
          console.error('Failed to parse download error payload:', error);
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      let filename = 'generated-image.png';
      const disposition = response.headers.get('content-disposition');

      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/i);
        if (match?.[1]) {
          filename = match[1];
        }
      } else {
        try {
          const url = new URL(generatedImageUrl);
          const candidate = url.pathname.split('/').pop();
          if (candidate) {
            filename = candidate;
          }
        } catch (error) {
          console.error(
            'Unable to derive filename from generated image URL:',
            error
          );
        }
      }

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setLocalError(null);
    } catch (error) {
      console.error('Failed to download generated image:', error);
      setLocalError(t('errors.downloadFailed'));
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (localError || error) {
      setIsPromptOpen(true);
    }
  }, [error, localError]);

  return (
    <div className="rounded-2xl border bg-card/80 p-4 shadow-sm sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:gap-8">
        <div className="flex flex-col gap-4 sm:gap-5 lg:max-w-lg xl:max-w-xl">
          <div className="grid gap-3 min-[360px]:grid-cols-2 md:gap-3">
            {files.map((file, index) => {
              const preview = filePreviews[index];

              return (
                <div key={`reference-image-${index}`} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('upload.slotLabel', { index: index + 1 })}
                  </p>
                  <div
                    className={cn(
                      'relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed bg-background/60 p-5 text-center transition-colors sm:min-h-[210px]',
                      file
                        ? 'border-muted-foreground/50'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {preview ? (
                      <div className="relative w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt={t('upload.previewAlt')}
                          className="h-auto w-full rounded-lg border object-cover"
                        />
                        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                          <span
                            className="truncate"
                            title={file?.name ?? undefined}
                          >
                            {file?.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => clearFile(index)}
                            disabled={isBusy}
                            aria-label={t('upload.clearSlot', {
                              index: index + 1,
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Button
                          type="button"
                          onClick={() =>
                            fileInputRefs.current[index]?.click()
                          }
                          disabled={isBusy}
                        >
                          {t('upload.button')}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          {t('upload.hint')}
                        </p>
                      </div>
                    )}

                    <input
                      ref={(element) => {
                        fileInputRefs.current[index] = element;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        handleFileInputChange(index, event)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center md:text-left">
            {t('upload.subtitle')}
          </p>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {t('modes.title')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {modes.map((mode) => {
                const isActive = selectedMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => handleModeSelect(mode.key, mode.prompt)}
                    className={cn(
                      'flex h-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isActive
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-muted bg-transparent text-foreground hover:border-primary/60 hover:bg-primary/5'
                    )}
                    aria-pressed={isActive}
                  >
                    {mode.title}
                  </button>
                );
              })}
            </div>
          </div>

          <Collapsible
            open={isPromptOpen}
            onOpenChange={setIsPromptOpen}
            className="rounded-xl border bg-background/70"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground data-[state=open]:[&_svg]:rotate-180">
              <span>{t('prompt.label')}</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 border-t px-4 pb-4 pt-4 data-[state=closed]:hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {t('prompt.help')}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPrompt('')}
                  disabled={isBusy || !prompt}
                  aria-label={t('prompt.clear')}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={t('prompt.placeholder')}
                rows={4}
                className="resize-none"
                disabled={isBusy}
              />
            </CollapsibleContent>
          </Collapsible>

          {(localError || error) && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{localError || error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleGenerate} disabled={isBusy}>
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('actions.generating')}
                </>
              ) : (
                t('actions.generate')
              )}
            </Button>

            {generatedImageUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                disabled={isBusy}
              >
                {t('actions.clear')}
              </Button>
            )}

            {allUploaded && !isBusy && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5" />
                {t('status.uploaded')}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:gap-5">
          <div className="rounded-xl border bg-background/70 p-4 lg:p-5 xl:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('result.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('result.subtitle')}
                </p>
              </div>
              {generatedImageUrl && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={openPreview}
                    aria-label={t('result.previewHint')}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    aria-label={t('result.downloadHint')}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="relative flex min-h-[260px] items-center justify-center rounded-lg border bg-muted/40 sm:min-h-[300px] lg:min-h-[400px]">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : generatedImageUrl ? (
                <button
                  type="button"
                  className="group relative h-full w-full"
                  onClick={openPreview}
                  aria-label={t('result.previewHint')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generatedImageUrl}
                    alt={t('result.previewAlt')}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 hidden items-center justify-center bg-black/40 text-sm text-white group-hover:flex">
                    {t('result.previewCta')}
                  </div>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-10 w-10" />
                  <span className="text-sm">{t('result.empty')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={previewIsOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="border-none bg-transparent p-0 shadow-none">
          {generatedImageUrl && (
            <div className="flex items-center justify-center">
              <DialogTitle className="sr-only">
                {t('result.previewAlt')}
              </DialogTitle>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedImageUrl}
                alt={t('result.previewAlt')}
                className="h-auto max-h-[90vh] w-auto max-w-[90vw] rounded-2xl object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
