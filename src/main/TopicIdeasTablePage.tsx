"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  CellContext,
} from "@tanstack/react-table";
import Skeleton from "react-loading-skeleton";

const generateSlug = (title: string) => {
  const words = title.split(" ");
  const first10Words = words.slice(0, 10).join(" ");
  return encodeURIComponent(first10Words.replace(/ /g, "-"));
};

// Define Idea type
interface Idea {
  alias: string;
  input_problem: string;
  current_title: string;
  id: string;
  up_votes: number;
  down_votes: number;
  current_topic: string[];
}

const IdeaTitleRenderer = (value: string, id: string) => {
  const slug = generateSlug(value);
  const frontendUrl = `${window.location.origin}/idea/${id}/${slug}`;
  return (
    <a
      href={frontendUrl}
      rel="noopener noreferrer"
      className="text-blue-500 underline"
    >
      {value}
    </a>
  );
};

const ArrayCellRenderer = (value: string[] | string) => {
  return Array.isArray(value) ? value.join(", ") : value;
};

const TopicIdeasTable = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const topic: string = pathname?.split("/").pop() || "";
  const showOnlyMyIdeas = searchParams?.get("user_topics") === "true";

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const safeTopic = topic ?? "";
        const endpoint = showOnlyMyIdeas
          ? `/idea/list/owned_ideas?topic=${encodeURIComponent(safeTopic)}`
          : `/idea/list/public_ideas?topic=${encodeURIComponent(safeTopic)}`;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch ideas");
        }

        const data: Idea[] = await response.json();
        console.log("TopicIdeasTable - Ideas:", data);
        setIdeas(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [topic, showOnlyMyIdeas]);

  const columns = [
    { accessorKey: "alias", header: "Alias" },
    { accessorKey: "input_problem", header: "Problem" },
    {
      accessorKey: "current_title",
      header: "Idea Title",
      cell: (info: CellContext<Idea, string>) =>
        IdeaTitleRenderer(info.getValue(), info.row.original.id),
    },
    { accessorKey: "up_votes", header: "Upvotes" },
    { accessorKey: "down_votes", header: "Downvotes" },
    {
      accessorKey: "current_topic",
      header: "Topics",
      cell: (info: CellContext<Idea, string[] | string>) =>
        ArrayCellRenderer(info.getValue()),
    },
  ];

  const table = useReactTable({
    data: ideas,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="p-5">
        <Skeleton height={60} count={1} />
        <br />
        <Skeleton height={60} count={4} />
        <br />
        <Skeleton height={60} count={3} />
      </div>
    );
  }

  if (error) {
    console.error(error);
    return <div>Error fetching ideas: {error}</div>;
  }

  return (
    <div className="m-10 lg:ml-[320px] mt-20 rounded-2xl">
      <table className="w-full border-collapse border border-gray-300 mb-10">
        <thead className="bg-blue-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border border-gray-300 p-2">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border border-gray-300">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border border-gray-300 p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopicIdeasTable;
