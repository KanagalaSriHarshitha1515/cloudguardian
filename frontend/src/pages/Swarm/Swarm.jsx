import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import * as dockerService from "../../services/docker.service";
import ResourceTable from "../../components/docker/ResourceTable";
import Button from "../../components/common/Button";
import useDockerHost from "../../hooks/useDockerHost";

// docker.listNodes() returns raw Docker Node objects — nothing is flat.
// Hostname lives under Description, role/availability under Spec,
// current state under Status.
const columns = [
  { key: "hostname", label: "Hostname", render: (n) => n.Description?.Hostname || "—" },
  { key: "role", label: "Role", render: (n) => n.Spec?.Role || "—" },
  { key: "availability", label: "Availability", render: (n) => n.Spec?.Availability || "—" },
  { key: "status", label: "Status", render: (n) => n.Status?.State || "—" },
];

export default function Swarm() {
  const { connected, host } = useDockerHost();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!host) return;
    setLoading(true);
    try {
      setNodes(await dockerService.getSwarmNodes(host.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && host) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, host?.id]);

  const handleInit = async () => {
    if (!host) return;
    await dockerService.initSwarm(host.id);
    load();
  };

  return (
    <Box>
      <ResourceTable
        title="Swarm Nodes"
        columns={columns}
        rows={nodes}
        loading={loading}
        emptyTitle={connected ? "No swarm initialized" : "Connect a Docker Host first"}
        emptyDescription={
          connected ? "Initialize a swarm on this host to see nodes here." : "This project has no Docker Host connected yet."
        }
        action={connected && nodes.length === 0 ? <Button onClick={handleInit}>Initialize Swarm</Button> : null}
      />
    </Box>
  );
}