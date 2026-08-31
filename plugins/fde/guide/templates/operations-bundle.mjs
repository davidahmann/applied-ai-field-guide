export function healthCheck() {
  throw new Error("Canonical release template has no configured service health check.");
}

export function activateKillSwitch() {
  throw new Error("Canonical release template has no configured kill switch.");
}

export function rollback() {
  throw new Error("Canonical release template has no configured rollback controller.");
}
