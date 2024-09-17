import { Action, ActionPanel, Form, Icon, Image, List, useNavigation } from "@raycast/api";
import { execa } from "execa";
import { useCallback, useEffect } from "react";
import { useStreamJSON } from "@raycast/utils";

const env = process.env;
env.PATH = env.PAHT + ":/opt/homebrew/bin";
const child = execa({ env: env })`queryrs`;

export default function Command() {
  const { push } = useNavigation();

  const handleData = useCallback((data: string) => {
    if (data.length == 2) {
      return;
    }
    const path = data.toString().replace("\n", "").replace(">", "").trim();
    console.log(path);
    push(<TmpView path={`file://${path}`} />);
  }, []);

  useEffect(() => {
    child.stdout.on("data", handleData);
    return () => {
      child.stdout.off("data", handleData);
    };
  }, []);

  return (
    <Form
      searchBarAccessory={<Form.LinkAccessory target="https://query.rs/" text="Query.rs" />}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={"Query"}
            icon={Icon.MagnifyingGlass}
            onSubmit={(values) => {
              child.stdin.write(`${values.query}\n`);
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="query" title="Query" placeholder="Search Rust" />
      <Form.Description title="Commands" text={`:help, :book, :cargo, :stable, :tool, :yet`} />
      <Form.Separator />
      <Form.Description title="Stable std docs" text={`option, fn:find, trait:Iterator`} />
      <Form.Description title="Nightly std docs" text={`/async, /pin`} />
      <Form.Description title="Attributes" text={`#, #cfg, #derive`} />
      <Form.Description title="By type signature" text={`vec -> usize, [] -> bool`} />
      <Form.Separator />
      <Form.Description title="Search docs.rs" text={`!, !tokio, !axum`} />
      <Form.Description title="Search crates.io" text={`!!, !!sqlx, !!reqwest`} />
      <Form.Description title="Crate docs" text={`@tokio spawn`} />
      <Form.Description title="Repository" text={`!!!sqlx`} />
      <Form.Separator />
      <Form.Description title="Error code" text={`e0038`} />
      <Form.Description title="Rust books" text={`%, %pin, %error`} />
      <Form.Description title="Clippy lints" text={`>, >if_let, >try`} />
      <Form.Description title="Can I use" text={`?, ?const, ?slice`} />
    </Form>
  );
}

type Data = { content: string; description: string };

function TmpView({ path }: { path: string }) {
  const { data, isLoading, pagination } = useStreamJSON(path, {
    initialData: [] as Data[],
    pageSize: 20,
  });

  return (
    <List isLoading={isLoading} pagination={pagination}>
      {!data || data.length == 0 ? (
        <List.EmptyView icon={{ source: "logo-black.png" }} title={"No results found"} />
      ) : (
        data.map((item, index) => {
          const e = item as Data;
          const data = e.description.split("-");
          const isUrl = e.content.startsWith("http");
          return (
            <List.Item
              key={index}
              icon={getIcon(e.content)}
              title={data[0].trim()}
              subtitle={data.slice(1).join("-").trim()}
              accessories={[{ icon: isUrl ? Icon.Link : Icon.Text }]}
              actions={
                <ActionPanel>
                  {isUrl ? <Action.OpenInBrowser url={e.content} /> : <Action.CopyToClipboard content={e.content} />}
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}

function getIcon(url: string): Image.ImageLike {
  if (url.startsWith("https://crates.io")) {
    return { source: "crate.png" };
  } else if (url.startsWith("https://docs.rs")) {
    return { source: "docs.png" };
  } else {
    return { source: "rust.png" };
  }
}
