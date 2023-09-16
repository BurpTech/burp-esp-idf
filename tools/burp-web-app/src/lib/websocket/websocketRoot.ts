export default function websocketRoot(): string {
  let loc = window.location;
  let new_uri: string;
  if (loc.protocol === "https:") {
    new_uri = "wss:";
  } else {
    new_uri = "ws:";
  }
  new_uri += "//" + loc.host;
  new_uri += loc.pathname;
  return new_uri;
}