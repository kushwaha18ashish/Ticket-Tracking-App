import toast from 'react-hot-toast';

interface BasecampLinkProps {
  url?: string | null;
  compact?: boolean;
}

export function BasecampLink({ url, compact }: BasecampLinkProps) {
  if (!url) {
    return <span className="text-slate-400">—</span>;
  }

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success('Basecamp link copied');
  };

  if (compact) {
    return (
      <div className="flex gap-1">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline dark:text-blue-400"
          title="Open in Basecamp"
        >
          Open
        </a>
        <button
          type="button"
          onClick={copy}
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          title="Copy link"
        >
          Copy
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-blue-600 hover:underline dark:text-blue-400"
      >
        {url}
      </a>
      <button
        type="button"
        onClick={copy}
        className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
      >
        Copy
      </button>
    </div>
  );
}
