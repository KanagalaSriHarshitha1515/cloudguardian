import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import * as dockerService from "../../services/docker.service";
import ResourceTable from "../../components/docker/ResourceTable";
import ImageCard from "../../components/docker/ImageCard";
import useDockerHost from "../../hooks/useDockerHost";

// Your image.controller.js returns { id, tags, size, created } — tags is
// an array (RepoTags), size is raw bytes, created is a unix timestamp
// (seconds). None of these are display-ready as-is.
const columns = [
  { key: "repo", label: "Repository", render: (img) => (img.tags?.[0] || "<none>").split(":")[0] },
  { key: "tag", label: "Tag", render: (img) => (img.tags?.[0] || "<none>").split(":")[1] || "latest" },
  { key: "size", label: "Size", render: (img) => `${(img.size / 1024 / 1024).toFixed(1)} MB` },
  { key: "created", label: "Created", render: (img) => new Date(img.created * 1000).toLocaleDateString() },
];

export default function Images() {
  const { connected, host } = useDockerHost();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!host) return;
    setLoading(true);
    try {
      setImages(await dockerService.getImages(host.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && host) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, host?.id]);

  const handleDelete = async (id) => {
    if (!host) return;
    await dockerService.deleteImage(host.id, id);
    load();
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <ImageCard label="Total Images" value={images.length} />
      </Box>
      <ResourceTable
        title="Images"
        columns={columns}
        rows={images}
        loading={loading}
        emptyTitle={connected ? "No images found" : "Connect a Docker Host first"}
        emptyDescription={connected ? "Pull an image to get started." : "This project has no Docker Host connected yet."}
        renderRowActions={(row) => (
          <button
            onClick={() => handleDelete(row.id)}
            style={{ color: "#EF4444", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            Remove
          </button>
        )}
      />
    </Box>
  );
}