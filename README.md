## Obsidian Auto Linker

This is an early alpha of a plugin that allows for aliases to be referenced directly like `[[this]]` rather than `[[filename|this]]`

In order to accomplish this, the plugin patches the default Obsidian link resolution logic. The logic will remain the same if the link resolves to an existing file in the vault. The new behavior is that, if no existing file is found, it will attempt to find a document containing a matching alias.

The logic will pick the closest and first document with a matching alias. If you have multiple documents with the same alias, the first and closest document will always be resolved. If you want to maintain multiple documents with the same alias, it is recommended that you continue to fully qualify them as normal [[file|alias]].

If you have an actual file with the same name as one of your aliases, the actual file will always be preferred. In the future, there may be an option to always prefer aliases.

If you notice any weirdness with indexing, link resolution or the graph view, disable this plugin and everything will revert back to the default resolution logic.

### Components that now support bare aliases

- Graph view
- Backlinks
- Embeds
- Resolved/Unresolved link display in preview mode

In theory, this patch may automatically allow other plugins, like DataView, to resolve bare aliases but that has not yet been tested.

### Installing via BRAT

Install the BRAT plugin via the Obsidian Plugin Browser and then add the beta repository "nothingislost/obsidian-auto-linker"

### Manually installing the plugin

- Copy over `main.js`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/obsidian-auto-linker/`.
