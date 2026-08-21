import Docker from "dockerode";

// Builds the connection config Dockerode needs based on which method
// the frontend's ConnectDockerHost form sent — matches the four
// CONNECTION_TYPES from the frontend (tcp / tcp-tls / ssh / socket).
function buildDockerodeOptions(payload) {
  const { type, host, port, caCert, clientCert, clientKey, socketPath } = payload;

  switch (type) {
    case "tcp":
      return { host, port: Number(port), protocol: "http" };

    case "tcp-tls":
      if (!caCert || !clientCert || !clientKey) {
        const err = new Error("TLS connections require caCert, clientCert, and clientKey");
        err.statusCode = 400;
        throw err;
      }
      return {
        host,
        port: Number(port),
        protocol: "https",
        ca: caCert,
        cert: clientCert,
        key: clientKey,
      };

    case "socket":
      return { socketPath: socketPath || "/var/run/docker.sock" };

    case "ssh":
      // Dockerode doesn't speak SSH directly — the real way to support this
      // is opening an SSH tunnel (e.g. with the `ssh2` package) that forwards
      // a local port to the remote /var/run/docker.sock, then pointing
      // Dockerode at that local forwarded port. That tunnel-management layer
      // isn't included here since it needs session/lifecycle handling
      // (keeping the tunnel alive, reconnecting, cleanup on disconnect).
      // For now this throws clearly instead of silently failing.
      const err = new Error("SSH connections aren't implemented yet — see comment in dockerHost.service.js");
      err.statusCode = 501;
      throw err;

    default: {
      const err = new Error(`Unknown connection type: ${type}`);
      err.statusCode = 400;
      throw err;
    }
  }
}

// Actually attempts to reach the Docker Engine and confirms it responds.
// Throws if the connection or auth fails — the controller turns that into
// the right HTTP status instead of silently returning success.
export async function testConnection(payload) {
  const options = buildDockerodeOptions(payload);
  const docker = new Docker(options);

  // docker.info() is a good connectivity+auth check: it requires a real
  // successful round trip to the daemon, not just a TCP handshake.
  const info = await docker.info();

  return {
    dockerVersion: info.ServerVersion,
    os: info.OperatingSystem,
    containersRunning: info.ContainersRunning,
    containersTotal: info.Containers,
    images: info.Images,
  };
}

export function getDockerodeOptions(payload) {
  return buildDockerodeOptions(payload);
}