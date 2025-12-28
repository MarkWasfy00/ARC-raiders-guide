export function encodeSkillBuild(unlockedSkills: string[], expeditionPoints: number): string {
  // Create a compact representation
  // Format: expeditionPoints.skill1,skill2,skill3
  const skillIds = Array.from(unlockedSkills).sort().join(',');
  const encoded = `${expeditionPoints}.${skillIds}`;

  // Base64 encode for URL safety
  return btoa(encoded);
}

export function decodeSkillBuild(encoded: string): { unlockedSkills: string[]; expeditionPoints: number } | null {
  try {
    // Decode from base64
    const decoded = atob(encoded);

    // Split by first dot
    const dotIndex = decoded.indexOf('.');
    if (dotIndex === -1) {
      return null;
    }

    const expeditionPoints = parseInt(decoded.substring(0, dotIndex));
    const skillsPart = decoded.substring(dotIndex + 1);

    if (isNaN(expeditionPoints)) {
      return null;
    }

    const unlockedSkills = skillsPart ? skillsPart.split(',').filter(Boolean) : [];

    return { unlockedSkills, expeditionPoints };
  } catch (error) {
    console.error('Failed to decode skill build:', error);
    return null;
  }
}

export function generateShareUrl(unlockedSkills: Set<string>, expeditionPoints: number): string {
  const encoded = encodeSkillBuild(Array.from(unlockedSkills), expeditionPoints);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/skill-tree?build=${encoded}`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for older browsers
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      resolve();
    } catch (error) {
      document.body.removeChild(textArea);
      reject(error);
    }
  });
}
