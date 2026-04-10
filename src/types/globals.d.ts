// Minimal global declarations used throughout the client code. These are
// intentionally permissive — the runtime environment is the browser, but some
// modules conditionally reference Node globals like `Buffer` or `process`.
declare var Buffer: any;
declare var process: any;


