export const NO_TEXT_RULE = 'No text, letters, numbers, logos, or watermarks anywhere in the image.';

/** anchors + blank line + scene + blank line + NO_TEXT_RULE. Surrounding whitespace of each part is trimmed. */
export function composeImagePrompt(anchors: string, scene: string): string {
  return `${anchors.trim()}\n\n${scene.trim()}\n\n${NO_TEXT_RULE}`;
}
