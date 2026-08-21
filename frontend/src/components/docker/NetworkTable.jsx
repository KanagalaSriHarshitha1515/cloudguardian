import ResourceTable from "./ResourceTable";

// Real Docker Engine API fields (raw Dockerode passthrough from your
// backend — see network.controller.js) are PascalCase, and Subnet is
// nested inside IPAM.Config[0], not a flat field. Using render() per
// column to pull the right nested value instead of assuming lowercase
// flat keys.
const columns = [
  { key: "name", label: "Name", render: (n) => n.Name },
  { key: "driver", label: "Driver", render: (n) => n.Driver },
  {
    key: "subnet",
    label: "Subnet",
    render: (n) => n.IPAM?.Config?.[0]?.Subnet || "—",
  },
  {
    key: "containers",
    label: "Containers",
    // The list endpoint doesn't always include a Containers map — Docker
    // only reliably returns that on individual inspect, not list. Falls
    // back to 0 rather than crashing when it's absent.
    render: (n) => (n.Containers ? Object.keys(n.Containers).length : 0),
  },
];

export default function NetworkTable({ networks, loading, onDelete }) {
  return (
    <ResourceTable
      title="Networks"
      columns={columns}
      rows={networks}
      loading={loading}
      emptyTitle="No networks found"
      emptyDescription="Networks created on this Docker Host will appear here."
      renderRowActions={(row) => (
        <button
          onClick={() => onDelete(row.Id)}
          style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
        >
          Remove
        </button>
      )}
    />
  );
}