export interface IDeclarationTransformersOptions {
	usedExports: Set<string>;
	supportedExtensions: string[];
	moduleNames: string[];
	entryFileName: string;
	outFileName: string;
	chunkToOriginalFileMap: Map<string, string[]>;
	fileToRewrittenIncludedExportModuleSpecifiersMap: Map<string, Set<string>>;
}