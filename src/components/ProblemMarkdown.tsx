import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ProblemMarkdown({ description }: { description: string }) {
  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert prose-pre:bg-zinc-950 prose-pre:text-zinc-100">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
    </article>
  );
}
