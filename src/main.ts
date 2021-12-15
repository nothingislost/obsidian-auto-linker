import { Plugin, MetadataCache } from "obsidian";
import { around } from "monkey-around";

declare module "obsidian" {
  interface MetadataCache {
    initialized: boolean;
    initialize(): void;
    getLinkSuggestions(): any[];
  }
}

export default class ObsidianAutoLinkerPlugin extends Plugin {
  aliasCache: any[];
  patchMDCacheUninstaller: () => void;

  async onload() {
    const plugin = this;
    this.aliasCache = [];

    this.patchMDCacheUninstaller = around(MetadataCache.prototype, {
      // Here we patch the logic of getFirstLinkpathDest to resolve aliases
      //   and treat them with top priority
      // This means that if an alias name exists,it will always take priority
      //   over an actual file with the same name.
      getFirstLinkpathDest(old: any) {
        return function (link, ctxPath) {
          const result = old.call(this, link, ctxPath);
          if (result) {
            return result;
          }
          try {
            // don't crash the method!
            const alias = plugin.getFileByAlias(link);
            if (alias) {
              return alias.file;
            } else {
              return null;
            }
          } catch {
            return null;
          }
        };
      },
    });
    this.register(this.patchMDCacheUninstaller);

    // If the cache has already been inialized, that most likely means
    //    that it was loaded before we were able to patch.
    // Rerun init so that the cache gets updated.
    if (this.app.metadataCache.initialized) {
      // This call is overkill but it reloads the unresolved and resolved caches
      // the call is async and takes around 200ms on a ~3k file vault
      this.app.metadataCache.initialize();
    }
  }

  async onunload() {
    this.patchMDCacheUninstaller();
    this.app.metadataCache.initialize();
  }

  getFileByAlias(alias: string) {
    // populate an emphemeral alias cache so that we don't slow this method down horribly
    // the cache lives for 2 seconds before being cleared
    this.populatAliasCache();
    return this.aliasCache.find(a => a.alias?.toLowerCase() === alias.toLowerCase());
  }

  clearAliasCache() {
    setTimeout(() => {
      this.aliasCache = [];
    }, 2000);
  }

  populatAliasCache() {
    // on a vault of ~3k files, this takes around 3ms to populate
    if (!this.aliasCache.length) {
      this.aliasCache = this.app.metadataCache.getLinkSuggestions().filter(file => file.alias);
      this.clearAliasCache();
    }
  }
}
