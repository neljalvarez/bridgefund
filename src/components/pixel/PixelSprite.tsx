export type SpriteName = "student" | "school" | "coin" | "key" | "scroll" | "chest" | "flag" | "heart" | "star";

const PALETTE: Record<string, string> = {
  K: "#232824", // ink
  S: "#B07A52", // skin
  H: "#2E2219", // hair
  F: "#294C3D", // forest
  G: "#D8AA55", // gold
  T: "#C97052", // terracotta
  P: "#F5F0E1", // parchment
  A: "#BCC9B6", // sage
  W: "#FBF8EF", // white-ish
  D: "#8C6A3C", // dark gold
};

const SPRITES: Record<SpriteName, string[]> = {
  student: [
    "...HHHH...",
    "..HHHHHH..",
    "..HSSSSH..",
    "..SKSSKS..",
    "..SSSSSS..",
    "...SSSS...",
    ".GTTTTTTG.",
    "GGTTTTTTSG",
    "GGTTTTTTSG",
    "GG.TTTT.S.",
    "...KKKK...",
    "...KK.KK..",
    "...KK.KK..",
    "..KKK.KKK.",
  ],
  school: [
    ".....GG.......",
    ".....GGGG.....",
    ".....GG.......",
    ".....K........",
    "....TTTT......",
    "...TTTTTT.....",
    "..TTTTTTTT....",
    ".TTTTTTTTTT...",
    "KKKKKKKKKKKK..",
    ".PPPPPPPPPP...",
    ".PFFPPPPFFP...",
    ".PFFPPPPFFP...",
    ".PPPPKKPPPP...",
    ".PPPPKKPPPP...",
    ".PPPPKKPPPP...",
  ],
  coin: ["..GGGG..", ".GDDDDG.", "GDGGGGDG", "GDGDDGDG", "GDGDDGDG", "GDGGGGDG", ".GDDDDG.", "..GGGG.."],
  key: ["..GGG...", ".G...G..", ".G...G..", "..GGG...", "...G....", "...GG...", "...G....", "...GG..."],
  scroll: [".PPPPPP.", "PKKKKKKP", ".PPPPPP.", ".PKKKKP.", ".PPPPPP.", ".PKKKP..", ".PPPPPP.", "PKKKKKKP"],
  chest: ["..DDDD..", ".DGGGGD.", "DGGGGGGD", "KKKKKKKK", "DGGKKGGD", "DGGGGGGD", "DGGGGGGD", "KKKKKKKK"],
  flag: ["KGGGG...", "KGGGGG..", "KGGGG...", "K.......", "K.......", "K.......", "K.......", "KK......"],
  heart: [".TT.TT..", "TTTTTTT.", "TTTTTTT.", ".TTTTT..", "..TTT...", "...T...."],
  star: ["...G....", "...G....", ".GGGGG..", "..GGG...", ".GG.GG..", "G.....G."],
};

interface Props {
  name: SpriteName;
  scale?: number;
  className?: string;
  title?: string;
  x?: number;
  y?: number;
  /** Render as a nested <g> inside an existing SVG instead of its own <svg>. */
  inline?: boolean;
}

export function PixelSprite({ name, scale = 3, className, title, x = 0, y = 0, inline }: Props) {
  const rows = SPRITES[name];
  const w = rows[0].length;
  const h = rows.length;
  const rects = rows.flatMap((row, ry) =>
    [...row].map((ch, rx) =>
      ch === "." ? null : <rect key={`${rx}-${ry}`} x={rx} y={ry} width={1.02} height={1.02} fill={PALETTE[ch]} />,
    ),
  );
  if (inline) {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`} className="crisp">
        {rects}
      </g>
    );
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      className={`crisp ${className ?? ""}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {rects}
    </svg>
  );
}
