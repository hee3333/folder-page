import type { QuartzComponent, QuartzComponentProps, SortFn } from "@quartz-community/types";
import { getDate, byDateAndAlphabetical } from "@quartz-community/utils/sort";
import { resolveRelative, isFolderPath } from "../util/path";
import type { FullSlug } from "../util/path";

export type { SortFn } from "@quartz-community/types";
export { byDateAndAlphabetical };

export function byDateAndAlphabeticalFolderFirst(_cfg: unknown): SortFn {
  return (f1, f2) => {
    const f1IsFolder = isFolderPath(f1.slug ?? "");
    const f2IsFolder = isFolderPath(f2.slug ?? "");
    if (f1IsFolder && !f2IsFolder) return -1;
    if (!f1IsFolder && f2IsFolder) return 1;

    if (f1.dates && f2.dates) {
      return (getDate(f2)?.getTime() ?? 0) - (getDate(f1)?.getTime() ?? 0);
    } else if (f1.dates && !f2.dates) {
      return -1;
    } else if (!f1.dates && f2.dates) {
      return 1;
    }
    const f1Title = f1.frontmatter?.title?.toLowerCase() ?? "";
    const f2Title = f2.frontmatter?.title?.toLowerCase() ?? "";
    return f1Title.localeCompare(f2Title);
  };
}

type DateComponentProps = {
  date: Date;
  locale: string;
};

function DateDisplay({ date, locale }: DateComponentProps) {
  return (
    <time dateTime={date.toISOString()}>
      {date.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })}
    </time>
  );
}

type PageListProps = {
  limit?: number;
  sort?: SortFn;
} & QuartzComponentProps;

export const PageList: QuartzComponent = ({
  cfg,
  fileData,
  allFiles,
  limit,
  sort,
}: PageListProps) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst(cfg);
  let list = [...allFiles].sort(sorter);
  if (limit) {
    list = list.slice(0, limit);
  }

  const fileSlug = (fileData as { slug?: string } | undefined)?.slug as FullSlug | undefined;

  return (
    <ul class="section-ul">
      {list.map((page) => {
        const title = page.frontmatter?.title;
        const tags = (page.frontmatter?.tags ?? []) as string[];

        return (
          <li class="section-li">
            <div class="section">
        
              <div class="desc">
                <h3>
                  <a
                    href={resolveRelative(fileSlug ?? ("" as FullSlug), page.slug as FullSlug)}
                    class="internal"
                  >
                    {title}
                  </a>
                </h3>
                {typeof page.description === "string" && (
  <p class="page-preview">{page.description}</p>
)}
                <p class="meta">
                {page.dates && getDate(page) && (
                  <DateDisplay
                    date={getDate(page)!}
                    locale={(cfg as { locale?: string } | undefined)?.locale ?? "en-US"}
                  />
                )}
              </p>
              </div>
              <ul class="tags">
                {tags.map((tag) => (
                  <li>
                    <a
                      class="internal tag-link"
                      href={resolveRelative(
                        fileSlug ?? ("" as FullSlug),
                        `tags/${tag}` as unknown as FullSlug,
                      )}
                    >
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

PageList.css = `
.section h3 {
  margin: 0;
}

.section > .tags {
  margin: 0;
}
.section .page-preview {
  margin: 0.4rem 0 0;
  color: var(--gray);
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`;

li.section-li {
  margin: 0;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--lightgray);
}

li.section-li > .section {
  display: block;
}

.section h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 400;
}

.section h3 a {
  color: var(--secondary);
  text-decoration: none;
}

.section h3 a:hover {
  text-decoration: underline;
}

.section .page-preview {
  margin: 0.5rem 0 0.75rem;
  color: var(--darkgray);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.section .meta {
  margin: 0;
  color: var(--gray);
  font-size: 0.85rem;
  opacity: 1;
}

.section > .tags {
  display: none;
}
