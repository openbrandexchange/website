// The explainer video (website/video, composition ExplainerV2, renders in video/out/v3/): one English
// voice-over, captions burned in per language. Languages without their own render get the English
// captions. The previous version stays in public/video/obx-{en,nl}.* for a quick rollback.
export const VIDEO_LANGS = ['en', 'nl', 'de', 'fr'];

export function videoFor(lang: string): string {
  return `/video/v3/obx-v3-${VIDEO_LANGS.includes(lang) ? lang : 'en'}`;
}
