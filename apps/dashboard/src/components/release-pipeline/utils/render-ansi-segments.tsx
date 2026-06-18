import { ansiColorMap } from '../../../constants/messages';

export function renderAnsiSegments(text: string) {
  // eslint-disable-next-line no-control-regex
  const regex = /\u001b\[([0-9;]*)m/g;
  const segments: Array<{
    text: string;
    color?: string;
    bold?: boolean;
  }> = [];

  let lastIndex = 0;
  let activeColor: string | undefined;
  let activeBold = false;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        color: activeColor,
        bold: activeBold,
      });
    }

    const codes = match[1]
      .split(';')
      .map(part => Number(part))
      .filter(code => !Number.isNaN(code));

    if (codes.length === 0 || codes.includes(0)) {
      activeColor = undefined;
      activeBold = false;
    }

    if (codes.includes(1)) {
      activeBold = true;
    }

    const foregroundCode = [...codes]
      .reverse()
      .find(code => ansiColorMap[code]);
    if (foregroundCode) {
      activeColor = ansiColorMap[foregroundCode];
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      color: activeColor,
      bold: activeBold,
    });
  }

  return segments.map((segment, index) => (
    <span
      key={`${segment.text}-${index}`}
      style={{
        color: segment.color,
        fontWeight: segment.bold ? 700 : 400,
      }}
    >
      {segment.text}
    </span>
  ));
}
