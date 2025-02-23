"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import 'katex/dist/katex.min.css'; // `rehype-katex` does not import the CSS for you



const MarkdownRenderer = ({ content }: { content: any }) => {


 const preprocessLaTeX =  (content: string) => {
  // Replace block-level LaTeX delimiters \[ \] with $$ $$

  
  const blockProcessedContent = content.replace(
    /\\\[(.*?)\\\]/gs,
    (_, equation) => `$$${equation}$$`,
  );
  // Replace inline LaTeX delimiters \( \) with $ $
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\((.*?)\\\)/gs,
    (_, equation) => `$${equation}$`,
  );
  return inlineProcessedContent;
};


  const [processedContent, setProcessedContent] = useState(content);

  useEffect(() => {
    setProcessedContent(preprocessLaTeX(content));
  }, [content]);

  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {processedContent}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
