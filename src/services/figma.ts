const FIGMA_API_BASE = 'https://api.figma.com/v1';

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  absoluteBoundingBox?: FigmaRect;
  absoluteRenderBounds?: FigmaRect;
  backgroundColor?: FigmaColor;
  children?: FigmaNode[];
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  cornerRadius?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  clipsContent?: boolean;
  description?: string;
  style?: FigmaTextStyle;
  characters?: string;
}

export interface FigmaPaint {
  type: string;
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  gradientStops?: Array<{ color: FigmaColor; position: number }>;
  imageRef?: string;
}

export interface FigmaTextStyle {
  fontFamily?: string;
  fontPostScriptName?: string;
  fontWeight?: number;
  fontSize?: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
}

export interface FigmaFrameDetails {
  fileKey: string;
  nodeId: string;
  node: FigmaNode;
}

/** Parse a Figma URL and extract the file key and node ID. */
export function parseFigmaUrl(url: string): { fileKey: string; nodeId: string } | null {
  const match = url.match(/figma\.com\/(?:design|file)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  const fileKey = match[1];
  const nodeParam = new URL(url).searchParams.get('node-id');
  if (!nodeParam) return null;
  // node-id in URLs uses '-' separator; API expects ':' separator
  const nodeId = nodeParam.replace('-', ':');
  return { fileKey, nodeId };
}

/** Fetch details for a specific frame/node from the Figma REST API. */
export async function fetchFigmaFrameDetails(
  fileKey: string,
  nodeId: string,
  token: string,
): Promise<FigmaFrameDetails> {
  const encodedId = encodeURIComponent(nodeId);
  const url = `${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${encodedId}`;

  const res = await fetch(url, {
    headers: { 'X-Figma-Token': token },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Figma API error ${res.status}: ${body}`);
  }

  const data = await res.json() as {
    nodes: Record<string, { document: FigmaNode }>;
  };

  const nodeData = data.nodes[nodeId];
  if (!nodeData) {
    throw new Error(`Node ${nodeId} not found in file ${fileKey}`);
  }

  return { fileKey, nodeId, node: nodeData.document };
}

/** Convenience wrapper: parse a Figma URL and fetch frame details. */
export async function fetchFigmaFrameFromUrl(
  figmaUrl: string,
  token: string,
): Promise<FigmaFrameDetails> {
  const parsed = parseFigmaUrl(figmaUrl);
  if (!parsed) {
    throw new Error(`Invalid Figma URL: ${figmaUrl}`);
  }
  return fetchFigmaFrameDetails(parsed.fileKey, parsed.nodeId, token);
}
