"use client";

import { createContext, useContext, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const CodeBlockContext = createContext(false);

function Pre({ children, ...rest }: ComponentPropsWithoutRef<"pre">) {
  return (
    <CodeBlockContext.Provider value={true}>
      <pre {...rest}>{children}</pre>
    </CodeBlockContext.Provider>
  );
}

function Code({ className, children, ...rest }: ComponentPropsWithoutRef<"code">) {
  const isBlock = useContext(CodeBlockContext);

  if (isBlock) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  return (
    <code
      className="rounded bg-zinc-100 px-1.5 py-0.5 font-normal text-zinc-800 before:content-none after:content-none dark:bg-zinc-800 dark:text-zinc-100"
      {...rest}
    >
      {children}
    </code>
  );
}

export function ProblemMarkdown({ description }: { description: string }) {
  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert prose-pre:bg-zinc-950 prose-pre:text-zinc-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{ pre: Pre, code: Code }}
      >
        {description}
      </ReactMarkdown>
    </article>
  );
}
