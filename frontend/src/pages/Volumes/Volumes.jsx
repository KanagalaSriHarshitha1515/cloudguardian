import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import * as dockerService from "../../services/docker.service";
import ResourceTable from "../../components/docker/ResourceTable";
import useDockerHost from "../../hooks/useDockerHost";

// Your volume.controller.js passes Docker's raw Volume objects straight
// through (no remapping) — real fields are Name/Driver/Mountpoint/CreatedAt.
// Note: Docker's list-volumes API doesn't return size or "used by" at all
// by default (that needs a separate UsageData query), so those columns
// were showing nothing because the data genuinely isn't there, not because
// of a mapping bug — swapped for Mountpoint/Created instead, which are real.
const columns = [
  { key: "name", label: "Name", render: (v) => v.Name },
  { key: "driver", label: "Driver", render: (v) => v.Driver },
  { key: "mountpoint", label: "Mountpoint", render: (v) => v.Mountpoint },
  { key: "created", label: "Created", render: (v) => (v.CreatedAt ? new Date(v.CreatedAt).toLocaleDateString() : "—") },
];

export default function Volumes() {
  const { connected, host } = useDockerHost();
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!host) return;
    setLoading(true);
    try {
      setVolumes(await dockerService.getVolumes(host.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && host) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, host?.id]);

  const handleDelete = async (name) => {
    if (!host) return;
    await dockerService.deleteVolume(host.id, name);
    load();
  };

  return (
    <Box>
      <ResourceTable
        title="Volumes"
        columns={columns}
        rows={volumes}
        loading={loading}
        emptyTitle={connected ? "No volumes found" : "Connect a Docker Host first"}
        emptyDescription={connected ? "Create a volume to get started." : "This project has no Docker Host connected yet."}
        renderRowActions={(row) => (
          <button
            onClick={() => handleDelete(row.Name)}
            style={{ color: "#EF4444", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            Remove
          </button>
        )}
      />
    </Box>
  );
}