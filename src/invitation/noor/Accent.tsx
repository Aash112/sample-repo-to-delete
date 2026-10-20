/** A title with its last word set in gold italic ("The day we *wed*"). Works for any config text. */
export function Accent({ text }: { text: string }) {
  const clean = text.replace(/\.$/, "");
  const cut = clean.lastIndexOf(" ");
  if (cut < 0) return <em>{clean}</em>;
  return (
    <>
      {clean.slice(0, cut)} <em>{clean.slice(cut + 1)}</em>
    </>
  );
}
