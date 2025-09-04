import { BookmarkRow } from "@/types/bookmark";

enum Result {
  Success = "success",
  Error = "error",
}

enum SortedStates {
  Ascending = "a-z",
  Descending = "z-a",
  Newest = "newest",
  Oldest = "oldest",
}

const sort_bookmarks = (bookmarks: BookmarkRow[], sortedState: SortedStates) => {
    const sorted = [...bookmarks];
    switch (sortedState) {
      case SortedStates.Ascending:
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case SortedStates.Descending:
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case SortedStates.Newest:
        return sorted.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
      case SortedStates.Oldest:
        return sorted.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return aTime - bTime;
        });
      default:
        return sorted;
    }
} 
``
export {Result, SortedStates, sort_bookmarks}