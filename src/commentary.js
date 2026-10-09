// Original commentary; never replaces the caller's message.
const lines = {
  debug: [
    "Sniffing for clues.",
    "Follow the trace, not the squirrel.",
    "One breakpoint. Two ears. Maximum attention.",
    "The missing value has left a scent trail.",
    "Logging the evidence before chasing the theory.",
    "The stack trace is our walking route.",
    "Small reproduction, big detective energy.",
    "Dallas found a clue. Benji would like to inspect the keyboard.",
  ],
  log: [
    "Filed under things I sniffed.",
    "Fetch complete. Filing the interesting bit.",
    "Another breadcrumb for future-us.",
    "This line has been approved by the tail department.",
    "A small update with excellent ears.",
    "Evidence delivered without chewing it.",
    "Keeping a trail through the code forest.",
    "Benji brought the log. Dallas brought enthusiasm.",
  ],
  info: [
    "Good to know. Good dog to tell you.",
    "A useful update, delivered at husky speed.",
    "The facts have arrived wearing sensible paws.",
    "Worth knowing before the next zoomie.",
    "No alarm. Just a well-timed nose boop.",
    "Status fetched. Tail at a responsible speed.",
    "A little context saves a lot of barking.",
    "Dallas and Benji have entered the observability business.",
  ],
  success: [
    "Treat budget approved.",
    "Good result. Better evidence. Best dog.",
    "The check passed. Save some applause for monitoring.",
    "One fewer problem between us and the walk.",
    "Tail deployment successful.",
    "The happy path has receipts today.",
    "Achievement unlocked: boring, repeatable success.",
    "Dallas celebrates. Benji is already planning the victory lap.",
  ],
  warn: [
    "Suspicious squirrel detected.",
    "Ears up. This deserves a closer look.",
    "Something smells odd; inspect before retrying.",
    "A warning is a breadcrumb, not a dare.",
    "The tail slowed down for a reason.",
    "Check the evidence before this becomes an incident.",
    "Potential trouble has arrived with muddy paws.",
    "Benji heard something. Dallas recommends checking the logs.",
  ],
  error: [
    "The dog has fetched the incident report.",
    "Read the first failure before chasing the pack.",
    "The red light is evidence, not a personality review.",
    "Pause the zoomies. Find the cause and the rollback.",
    "This needs a fix, not louder barking.",
    "Capture the reproduction while the scent is fresh.",
    "The operation failed. The team still gets kindness.",
    "Dallas and Benji are standing by with emotional support.",
  ],
};
export function barkLines(level) {
  if (typeof level !== "string" || !Object.hasOwn(lines, level))
    throw new RangeError("Choose debug, log, info, success, warn or error.");
  return [...lines[level]];
}
export function commentaryIndex(seed, salt, length) {
  if (seed === undefined) return 0;
  let hash = 2166136261;
  for (const char of salt + ":" + typeof seed + ":" + seed) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % length;
}
