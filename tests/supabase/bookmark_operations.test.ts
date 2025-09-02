import {
  fetch_bookmarks,
  process_bookmark,
  upsert_bookmark,
} from "@/lib/supabase/operations/bookmark";
import supabase from "@/lib/supabase/setup/supabase_init";
import { BookmarkInsert, BookmarkRow } from "@/types/bookmark";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/setup/supabase_init", () => ({
  default: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: "1",
            title: "Test",
            url: "https://test.com",
            user_id: "user123",
            scroll_x: 0,
            scroll_y: 0,
            created_at: "2024-01-01T00:00:00.000Z",
            thumbnail: "user123/1697059200000.png",
            notes: "This is a test bookmark",
          },
        ],
        error: null,
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            {
              id: "1",
              title: "Test",
              url: "https://test.com",
              user_id: "user123",
              scroll_x: 0,
              scroll_y: 0,
              created_at: "2024-01-01T00:00:00.000Z",
              thumbnail: "user123/1697059200000.png",
              notes: "This is a test bookmark",
            },
          ],
          error: null,
        }),
      }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "user123",
            email: "test@example.com",
          },
        },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {
          session: { access_token: "fake_token" },
          user: { id: "user123", email: "test@example.com" },
        },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: { access_token: "fake_token" },
          user: { id: "user123", email: "test@example.com" },
        },
        error: null,
      }),
      setSession: vi.fn().mockResolvedValue({
        error: null,
      }),
    },
  },
}));

describe("Bookmark Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetch_bookmarks", () => {
    it("should return bookmarks when successful", async () => {
      const result = await fetch_bookmarks();

      expect(supabase.from).toHaveBeenCalledWith("bookmarks");
      expect(result).toEqual([
        {
          id: "1",
          title: "Test",
          url: "https://test.com",
          user_id: "user123",
          scroll_x: 0,
          scroll_y: 0,
          created_at: "2024-01-01T00:00:00.000Z",
          thumbnail: "user123/1697059200000.png",
          notes: "This is a test bookmark",
        },
      ]);
    });

    it("should handle database errors", async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: () => ({
          order: () => ({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      const result = await fetch_bookmarks();
      expect(result).toBeNull();
    });
  });

  describe("upsert_bookmark", () => {
    const bookmarkData: BookmarkInsert = {
      title: "Test Bookmark",
      url: "https://test.com",
      user_id: "user123",
      scroll_x: 0,
      scroll_y: 0,
    };
    it("should create a new bookmark", async () => {
      const result = await upsert_bookmark(bookmarkData);

      expect(supabase.from).toHaveBeenCalledWith("bookmarks");
      expect(result).toEqual([
        {
          id: "1",
          title: "Test",
          url: "https://test.com",
          user_id: "user123",
          scroll_x: 0,
          scroll_y: 0,
          created_at: "2024-01-01T00:00:00.000Z",
          thumbnail: "user123/1697059200000.png",
          notes: "This is a test bookmark",
        },
      ]);
    });
    it("should handle insertion errors", async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        insert: () => ({
          select: () => ({
            data: null,
            error: { message: "Insertion error" },
          }),
        }),
      });

      const result = await upsert_bookmark(bookmarkData);
      expect(result).toBeNull();
    });
  });
});
