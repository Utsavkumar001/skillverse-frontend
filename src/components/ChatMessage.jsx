import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

function MermaidDiagram({ code }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.render('mermaid-' + Date.now(), code)
        .then(({ svg }) => {
          ref.current.innerHTML = svg;
        })
        .catch(() => {
          // Silently show as code block if mermaid fails
          ref.current.innerHTML = `<pre style="background:#f3f4f6;padding:12px;border-radius:8px;font-size:12px;overflow-x:auto;">${code}</pre>`;
        });
    }
  }, [code]);

  return <div ref={ref} className="my-3 overflow-x-auto" />;
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm bg-gray-900 text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Code blocks
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match?.[1];

              if (!inline && lang === 'mermaid') {
                return <MermaidDiagram code={String(children).trim()} />;
              }

              if (!inline && lang) {
                return (
                  <SyntaxHighlighter
                    style={oneLight}
                    language={lang}
                    PreTag="div"
                    className="rounded-lg text-xs my-2"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              }

              return (
                <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              );
            },

            // Headings
            h1: ({ children }) => <h1 className="text-lg font-semibold text-gray-900 mt-3 mb-1">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-semibold text-gray-900 mt-3 mb-1">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-900 mt-2 mb-1">{children}</h3>,

            // Lists
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-gray-700">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-gray-700">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,

            // Bold & Italic
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            em: ({ children }) => <em className="italic text-gray-700">{children}</em>,

            // Blockquote
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-3 my-2 text-gray-600 italic">
                {children}
              </blockquote>
            ),

            // Table
            table: ({ children }) => (
              <div className="overflow-x-auto my-3">
                <table className="w-full text-xs border-collapse border border-gray-200 rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => <th className="bg-gray-200 text-gray-700 font-semibold px-3 py-2 text-left border border-gray-200">{children}</th>,
            td: ({ children }) => <td className="px-3 py-2 border border-gray-100 text-gray-600">{children}</td>,

            // Horizontal rule
            hr: () => <hr className="border-gray-200 my-3" />,

            // Paragraph
            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}