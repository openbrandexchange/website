// The explainer video (website/video, composition ExplainerV2, renders in video/out/v3/): one English
// voice-over, captions burned in per language. Languages without their own render get the English
// captions. The previous version stays in public/video/obx-{en,nl}.* for a quick rollback.
// The files are cached for a week at the edge and in browsers: bump VIDEO_REV whenever a render
// replaces a file under the same name (2: natural English voice-over, "days, not months").
export const VIDEO_REV = '2';

export const VIDEO_LANGS = ['en', 'nl', 'de', 'fr'];

export function videoFor(lang: string): string {
  return `/video/v3/obx-v3-${VIDEO_LANGS.includes(lang) ? lang : 'en'}`;
}

/** The URL of one file of the video (ext: jpg, webm, mp4), with the revision for the caches. */
export const videoFile = (lang: string, ext: string) => `${videoFor(lang)}.${ext}?r=${VIDEO_REV}`;
