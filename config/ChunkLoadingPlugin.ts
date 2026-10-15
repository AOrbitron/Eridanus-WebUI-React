import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Use the compiler's webpack instance: Umi bundles its own webpack version.
export default class ChunkLoadingPlugin {
  apply(compiler: any) {
    const { RuntimeModule, RuntimeGlobals } = compiler.webpack;
    const source = readFileSync(join(__dirname, 'chunk-loading-runtime.js'), 'utf8');

    class ChunkLoadingRuntime extends RuntimeModule {
      constructor() {
        // Install after webpack has created its chunk/script loaders.
        super('eridanus chunk loading', RuntimeModule.STAGE_ATTACH);
      }

      generate() {
        return source;
      }
    }

    compiler.hooks.thisCompilation.tap('ChunkLoadingPlugin', (compilation: any) => {
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.ensureChunk)
        .tap('ChunkLoadingPlugin', (chunk: any, requirements: Set<string>) => {
          requirements.add(RuntimeGlobals.loadScript);
          compilation.addRuntimeModule(chunk, new ChunkLoadingRuntime());
        });
    });
  }
}
