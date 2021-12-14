import { Plugin, WorkspaceLeaf } from "obsidian";
import { around } from "monkey-around";

export default class ObsidianAutoLinkerPlugin extends Plugin {
  async onload() {
    const patchOpenFile = around(WorkspaceLeaf.prototype, {
      openLinkText(old: any) {
        return function (baseName, refPath, props) {
          // don't crash the default method
          try {
            // TODO: look into ways to possibly optimize this
            // with a vault of 3k files, this takes 3ms so it might be fine
            const alias = this.app.metadataCache
              .getLinkSuggestions()
              .find(a => a.alias?.toLowerCase() === baseName.toLowerCase());
            if (alias?.file?.basename) {
              baseName = alias.file.basename;
              return old.call(this, baseName, refPath, props);
            }
          } catch {}
          return old.call(this, baseName, refPath, props);
        };
      },
    }); 
    this.register(patchOpenFile);
  }
}
