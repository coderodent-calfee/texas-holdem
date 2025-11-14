declare interface WebpackRequire extends NodeRequire {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ): {
    keys: () => string[];
    <T>(id: string): T;
  };
}

declare const require: WebpackRequire;
