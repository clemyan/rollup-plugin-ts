import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {getImportedSymbolFromNamespaceImport} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {ensureHasDeclareModifier} from "../../../util/modifier-util";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {ensureNoDeclareModifierTransformer} from "../../ensure-no-declare-modifier-transformer/ensure-no-declare-modifier-transformer";
import {statementMerger} from "../../statement-merger/statement-merger";
import {preserveParents} from "../../../util/clone-node-with-meta";

export function visitNamespaceImport(options: ModuleMergerVisitorOptions<TS.NamespaceImport>): VisitResult<TS.NamespaceImport> {
	const {node, compatFactory, typescript, payload} = options;
	if (payload.moduleSpecifier == null) return options.childContinuation(node, undefined);

	const contResult = options.childContinuation(node, undefined);

	// If no SourceFile was resolved, preserve the ImportSpecifier as-is, unless it is already included in the chunk
	if (payload.matchingSourceFile == null) {
		return options.shouldPreserveImportedSymbol(getImportedSymbolFromNamespaceImport(contResult, payload.moduleSpecifier)) ? contResult : undefined;
	}

	// Otherwise, prepend the nodes for the SourceFile in a namespace declaration
	options.prependNodes(
		preserveParents(
			compatFactory.createModuleDeclaration(
				undefined,
				ensureHasDeclareModifier(undefined, compatFactory, typescript),
				compatFactory.createIdentifier(contResult.name.text),
				compatFactory.createModuleBlock([
					...options.includeSourceFile(payload.matchingSourceFile, {
						allowDuplicate: true,
						lexicalEnvironment: cloneLexicalEnvironment(),
						transformers: [ensureNoDeclareModifierTransformer, statementMerger({markAsModuleIfNeeded: false})]
					})
				]),
				typescript.NodeFlags.Namespace
			),
			options
		)
	);

	// Don't include the NamespaceImport
	return undefined;
}
