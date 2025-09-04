import { describe, it, expect } from "vitest";
import { BookmarkRow } from "@/types/bookmark";
import { sort_bookmarks, SortedStates } from "@/entrypoints/shared/utils";

describe("sort_bookmarks", () => {
  // Mock bookmark data for testing
  const mockBookmarks: BookmarkRow[] = [
    {
      id: "1",
      title: "Zebra Website",
      url: "https://zebra.com",
      user_id: "user1",
      created_at: "2024-01-01T10:00:00.000Z",
      thumbnail: "thumb1.jpg",
      scroll_x: 0,
      scroll_y: 0,
      notes: "First bookmark",
    },
    {
      id: "2",
      title: "Apple Website",
      url: "https://apple.com",
      user_id: "user1",
      created_at: "2024-01-03T10:00:00.000Z",
      thumbnail: "thumb2.jpg",
      scroll_x: 0,
      scroll_y: 0,
      notes: "Second bookmark",
    },
    {
      id: "3",
      title: "Microsoft Website",
      url: "https://microsoft.com",
      user_id: "user1",
      created_at: "2024-01-02T10:00:00.000Z",
      thumbnail: "thumb3.jpg",
      scroll_x: 0,
      scroll_y: 0,
      notes: "Third bookmark",
    },
  ];

  describe("Ascending sort (A-Z)", () => {
    it("should sort bookmarks by title in ascending order", () => {
      const result = sort_bookmarks(mockBookmarks, SortedStates.Ascending);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("Apple Website");
      expect(result[1].title).toBe("Microsoft Website");
      expect(result[2].title).toBe("Zebra Website");
    });

    it("should handle case-insensitive sorting", () => {
      const mixedCaseBookmarks: BookmarkRow[] = [
        { ...mockBookmarks[0], title: "zebra website" },
        { ...mockBookmarks[1], title: "Apple Website" },
        { ...mockBookmarks[2], title: "MICROSOFT WEBSITE" },
      ];

      const result = sort_bookmarks(mixedCaseBookmarks, SortedStates.Ascending);

      expect(result[0].title).toBe("Apple Website");
      expect(result[1].title).toBe("MICROSOFT WEBSITE");
      expect(result[2].title).toBe("zebra website");
    });
  });

  describe("Descending sort (Z-A)", () => {
    it("should sort bookmarks by title in descending order", () => {
      const result = sort_bookmarks(mockBookmarks, SortedStates.Descending);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("Zebra Website");
      expect(result[1].title).toBe("Microsoft Website");
      expect(result[2].title).toBe("Apple Website");
    });
  });

  describe("Newest first sort", () => {
    it("should sort bookmarks by creation date, newest first", () => {
      const result = sort_bookmarks(mockBookmarks, SortedStates.Newest);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("Apple Website"); // 2024-01-03
      expect(result[1].title).toBe("Microsoft Website"); // 2024-01-02
      expect(result[2].title).toBe("Zebra Website"); // 2024-01-01
    });

    it("should handle null created_at dates", () => {
      const bookmarksWithNullDates: BookmarkRow[] = [
        { ...mockBookmarks[0], created_at: null },
        mockBookmarks[1],
        { ...mockBookmarks[2], created_at: null },
      ];

      const result = sort_bookmarks(
        bookmarksWithNullDates,
        SortedStates.Newest
      );

      // Should put valid dates first, then null/undefined dates
      expect(result[0].title).toBe("Apple Website");
      expect(result[1].title).toBe("Zebra Website");
      expect(result[2].title).toBe("Microsoft Website");
    });
  });

  describe("Oldest first sort", () => {
    it("should sort bookmarks by creation date, oldest first", () => {
      const result = sort_bookmarks(mockBookmarks, SortedStates.Oldest);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("Zebra Website"); // 2024-01-01
      expect(result[1].title).toBe("Microsoft Website"); // 2024-01-02
      expect(result[2].title).toBe("Apple Website"); // 2024-01-03
    });

    it("should handle null created_at dates", () => {
      const bookmarksWithNullDates: BookmarkRow[] = [
        mockBookmarks[1], // Has valid date
        { ...mockBookmarks[0], created_at: null },
        { ...mockBookmarks[2], created_at: null },
      ];

      const result = sort_bookmarks(
        bookmarksWithNullDates,
        SortedStates.Oldest
      );

      // Should put null/undefined dates first (they get 0 timestamp)
      expect(result[0].created_at).toBeNull();
      expect(result[1].created_at).toBeNull();
      expect(result[2].title).toBe("Apple Website");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty bookmark array", () => {
      const result = sort_bookmarks([], SortedStates.Ascending);
      expect(result).toEqual([]);
    });

    it("should handle single bookmark", () => {
      const singleBookmark = [mockBookmarks[0]];
      const result = sort_bookmarks(singleBookmark, SortedStates.Ascending);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockBookmarks[0]);
    });

    it("should not mutate original array", () => {
      const originalBookmarks = [...mockBookmarks];
      const result = sort_bookmarks(mockBookmarks, SortedStates.Ascending);

      // Original array should remain unchanged
      expect(mockBookmarks).toEqual(originalBookmarks);
      // Result should be different order
      expect(result).not.toEqual(mockBookmarks);
    });

    it("should handle bookmarks with identical titles", () => {
      const duplicateTitleBookmarks: BookmarkRow[] = [
        {
          ...mockBookmarks[0],
          title: "Same Title",
          created_at: "2024-01-01T10:00:00.000Z",
        },
        {
          ...mockBookmarks[1],
          title: "Same Title",
          created_at: "2024-01-02T10:00:00.000Z",
        },
        {
          ...mockBookmarks[2],
          title: "Same Title",
          created_at: "2024-01-03T10:00:00.000Z",
        },
      ];

      const result = sort_bookmarks(
        duplicateTitleBookmarks,
        SortedStates.Ascending
      );
      expect(result).toHaveLength(3);
      // All titles should be the same, order may vary but shouldn't crash
      expect(result.every((bookmark) => bookmark.title === "Same Title")).toBe(
        true
      );
    });

    it("should handle bookmarks with identical dates", () => {
      const sameDateBookmarks: BookmarkRow[] = [
        { ...mockBookmarks[0], created_at: "2024-01-01T10:00:00.000Z" },
        { ...mockBookmarks[1], created_at: "2024-01-01T10:00:00.000Z" },
        { ...mockBookmarks[2], created_at: "2024-01-01T10:00:00.000Z" },
      ];

      const result = sort_bookmarks(sameDateBookmarks, SortedStates.Newest);
      expect(result).toHaveLength(3);
      // Should handle gracefully without errors
    });

    it("should handle default case", () => {
      // Cast to bypass TypeScript enum checking for testing
      const invalidSortState = "invalid" as SortedStates;
      const result = sort_bookmarks(mockBookmarks, invalidSortState);

      // Should return original order for invalid sort state
      expect(result).toEqual(mockBookmarks);
    });
  });

  describe("Date parsing edge cases", () => {
    it("should handle very old and very new dates", () => {
      const extremeDateBookmarks: BookmarkRow[] = [
        { ...mockBookmarks[0], created_at: "1970-01-01T00:00:00.000Z" }, // Unix epoch
        { ...mockBookmarks[1], created_at: "2099-12-31T23:59:59.999Z" }, // Far future
        { ...mockBookmarks[2], created_at: "2024-01-02T10:00:00.000Z" }, // Normal date
      ];

      const result = sort_bookmarks(extremeDateBookmarks, SortedStates.Newest);

      expect(result[0].created_at).toBe("2099-12-31T23:59:59.999Z"); // Newest
      expect(result[1].created_at).toBe("2024-01-02T10:00:00.000Z");
      expect(result[2].created_at).toBe("1970-01-01T00:00:00.000Z"); // Oldest
    });
  });
});
