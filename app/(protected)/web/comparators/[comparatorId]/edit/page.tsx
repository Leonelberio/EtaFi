//@ts-nocheck

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ComparatorDetailPage } from "@/app/(protected)/_components/single-comparator";
import Loader from "../../loading";

export default function ComparatorDetail() {
  const { comparatorId } = useParams(); // Extract the comparator [comparatorId] from the URL
  const [comparator, setComparator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchComparator = async () => {
      try {
        const response = await fetch(`/api/comparators/${comparatorId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch comparator");
        }
        const data = await response.json();
        setComparator(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparator();
  }, [comparatorId]);

  if (loading) {
    return <Loader/>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return comparator ? (
    <ComparatorDetailPage comparator={comparator} />
  ) : (
    <div>No comparator found</div>
  );
}
