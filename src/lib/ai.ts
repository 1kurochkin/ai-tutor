import {Annotation} from "@/components/pdf/pdf-view";

export interface ParsedAIResponse {
    cleanText: string;
    annotations: Annotation[];
    highlightedText: string[]
    navigation?: number;
}

export function parseChatAIResponse(response: string): ParsedAIResponse {
    const annotations: Annotation[] = [];
    const highlightedText: string[] = [];
    let navigation: number | undefined = undefined;
    let cleanText = response;

    // Parse NAVIGATE commands
    const navigateRegex = /\[NAVIGATE:(\d+)]/g;
    let match;
    while ((match = navigateRegex.exec(response)) !== null) {
        navigation = parseInt(match[1], 10);
        cleanText = cleanText.replace(match[0], '');
    }

    // Parse HIGHLIGHT commands
    const highlightRegex = /\[HIGHLIGHT:(\d+):([^\]]+)]/g;
    while ((match = highlightRegex.exec(response)) !== null) {
        const exactText = match[2];
        highlightedText.push(exactText);
        cleanText = cleanText.replace(match[0], '');
    }

    // Parse CIRCLE commands
// Parse CIRCLE commands with coordinates
    const circleRegex = /\[CIRCLE:(\d+):(\d+\.?\d*):(\d+\.?\d*):(\d+\.?\d*):(\d+\.?\d*):(\d+\.?\d*):(\d+\.?\d*)]/g;
    while ((match = circleRegex.exec(response)) !== null) {
        const currentPage = parseInt(match[1], 10);
        const x = parseFloat(match[2]);
        const y = parseFloat(match[3]);
        const width = parseFloat(match[4]);
        const height = parseFloat(match[5]);
        const pageWidth = parseFloat(match[6]);
        const pageHeight = parseFloat(match[7]);

        annotations.push({
            id: `circle-${Date.now()}-${Math.random()}`,
            type: 'circle',
            pageSize: {width: pageWidth, height: pageHeight},
            currentPage,
            coordinates: { x, y, width, height },
            color: '#ff6b6b',
        });

        cleanText = cleanText.replace(match[0], '');
    }

    // Normalize remaining text
    cleanText = cleanText.replace(/\s+/g, ' ').trim();

    return {
        cleanText,
        highlightedText,
        annotations,
        navigation,
    };
}
