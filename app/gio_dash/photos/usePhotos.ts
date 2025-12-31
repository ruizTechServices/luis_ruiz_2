import { useCallback, useEffect, useState } from "react";
import { listPhotos, seedHero } from "./api";
import { Img } from "./types";

type UsePhotosOptions = {
  initialPrefix?: string;
  initialLimit?: number;
};

export function usePhotos(options: UsePhotosOptions = {}) {
  const { initialPrefix = "", initialLimit = 500 } = options;

  const [prefix, setPrefix] = useState(initialPrefix);
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (p?: string) => {
      const targetPrefix = (p ?? prefix).trim();
      setLoading(true);
      setError(null);
      try {
        const imgs = await listPhotos(targetPrefix, initialLimit);
        setImages(imgs);
        return imgs;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [initialLimit, prefix]
  );

  const seedHeroImages = useCallback(async () => {
    setSeeding(true);
    setError(null);
    try {
      await seedHero();
      await load(prefix || "hero");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setSeeding(false);
    }
  }, [load, prefix]);

  useEffect(() => {
    load(initialPrefix).catch(() => {
      // Error state already set inside load
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    prefix,
    setPrefix,
    images,
    setImages,
    loading,
    seeding,
    error,
    setError,
    load,
    seedHeroImages,
  };
}
