import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import * as dockerService from "../../services/docker.service";
import NetworkTable from "../../components/docker/NetworkTable";
import useDockerHost from "../../hooks/useDockerHost";

export default function Networks() {
  const { connected, host } = useDockerHost();
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!host) return;
    setLoading(true);
    try {
      setNetworks(await dockerService.getNetworks(host.id));
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
    await dockerService.deleteNetwork(host.id, name);
    load();
  };

  return (
    <Box>
      <NetworkTable networks={networks} loading={loading} onDelete={handleDelete} />
    </Box>
  );
}