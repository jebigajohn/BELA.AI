// Shim to satisfy TypeScript when importing global CSS in app/layout.tsx
// Next.js normally provides these via next-env.d.ts, but some editors/linters may still warn.
declare module '*.css' {
  const content: string
  export default content
}
